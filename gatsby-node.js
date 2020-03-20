const path = require('path')
const isIndex = (name) => (name === `index` || name.indexOf('__index') !== -1)

module.exports.onCreateNode = ({node, actions}) => {
    if(typeof node.internal.type !== 'undefined') {
        if(node.internal.type === 'MarkdownRemark') {
            const { createNodeField } = actions

            let slug = `${path.basename(node.fileAbsolutePath, '.md')}`
            let priority = 1

            if( node.fileAbsolutePath.includes(`${path.sep}articles${path.sep}`) ) {
                let parts = node.fileAbsolutePath.split('src')[1].split(path.sep)
                parts.shift()
                
                createNodeField({
                    node: node,
                    name: 'topic',
                    value: parts[1]
                })
                
                if(4 === parts.length) {
                    let series = parts[2].replace(/-/g, ' ');
                    console.log(`creating series field for ${series}`)
                    
                    
                    createNodeField({
                        node: node,
                        name: 'series',
                        value: series
                    })
                }
                parts.pop()
                
                fileName = path.basename(node.fileAbsolutePath, '.md')
                if( !isIndex(fileName) ) {
                    const filename_priority = parseInt(fileName[0], 10);
                    fileName = fileName.split("__")
                    priority = filename_priority ? filename_priority : priority
                    fileName = fileName[fileName.length - 1]
                } 

                slug = `${path.sep}${parts.join(path.sep)}${path.sep}${fileName}`.toLowerCase()

                createNodeField({
                    node,
                    name: 'type',
                    value: 'article'
                })  
            }

            createNodeField({
                node: node,
                name: 'priority',
                value: priority
            })

            createNodeField({
                node: node,
                name: 'slug',
                value: slug
            })
        }
    }
    
}

module.exports.createPages = async ({ graphql, actions }) => {
    const { createPage } = actions
    let template = path.resolve(`./src/templates/blog.js`)
    const res = await graphql(`
        query {
            allMarkdownRemark {
                edges {
                    node {
                       fields {
                            slug
                            type
                        }
                    }
                }
            }
        }
    `)

    res.data.allMarkdownRemark.edges.forEach((edge) => {
        if(null !== edge.node.fields.type) {
            switch(edge.node.fields.type) {
                case 'article':
                    template = path.resolve(`./src/templates/article.js`)
                    break
                case 'review':
                    template = path.resolve(`./src/templates/review.js`)
                    break
            }
        }

        createPage({
            component: template,
            path: `${edge.node.fields.slug}`,
            context: {
                slug: edge.node.fields.slug
            }
        })
    })
}