/**
 * Tabs
 * 
 * @since HybridMag 1.0.0
 */
 (function() {

    var uiwCounter = 0;
    
    // Counter to be used to create a unique id.
    function incrementCounter() {
        uiwCounter = uiwCounter + 1;
        return uiwCounter;
    }

    // Creates a uniqueId.
    function uniqueId() {
        var count = incrementCounter();
        return "th-id-" + count.toString();
    }

    /**
     * Tabs constructor function.
     * 
     * @param {*} element 
     */
    function Tabs(element) {
        this.element = element;
        this.tablist = element.querySelector('ul');
        this.tabs = this.tablist.querySelectorAll('a');
        this.panels = [];

        this.setup();
        this.addListeners();
        // Always open the first tab at start.
        this.openTab(this.tabs[0], false);
    }

    // Initial Setup for the whole tab widget.
    Tabs.prototype.setup = function() {

        // Set the tablist role.
        this.tablist.setAttribute("role", "tablist");

        for( var i = 0; i < this.tabs.length; i++ ) {
            var tab = this.tabs[i];
            var panelId = tab.getAttribute('href');
            var ariaControl = panelId.substring(1);

            var uid = uniqueId();
            this.setupTab(tab, uid, ariaControl);

            var panel = this.element.querySelector(panelId);

            // If there is not a panel just ignore.
            if( panel != null ) {
                panel = this.setupPanel(panel, uid);
                this.panels.push(panel);
            }
        }
    };

    // Initial setup for tabs.
    Tabs.prototype.setupTab = function(tab, uniqueId, ariaControl) {
        var listitem = tab.parentElement;

        tab.setAttribute("id", uniqueId);

        listitem.setAttribute("role", "tab");
        listitem.setAttribute("aria-labelledby", uniqueId);
        listitem.setAttribute("aria-controls", ariaControl);
    };

    // Initial setup for panels.
    Tabs.prototype.setupPanel = function(panel, uniqueId) {
        panel.setAttribute("aria-labelledby", uniqueId);
        panel.setAttribute("role", "tabpanel")
        return panel;
    };

    // Add event listeners.
    Tabs.prototype.addListeners = function() {
        var self = this;
        for( var i = 0; i < this.tabs.length; i++ ) {
            this.tabs[i].addEventListener('click', function(event) {
                event.preventDefault();
                self.openTab(this);
            }); 
            this.tabs[i].addEventListener('keydown', function(event) {
                self.keyDownEventListener(event);
            });
        }
    };

    // Key up event listener.
    Tabs.prototype.keyDownEventListener = function(event) {

        if( event.keyCode == 39 ) {
            var tabId = event.target.id;
            var tabIndex = 0;
            var tabsLength = this.tabs.length;

            var tabIndex = this.getTabPosition(tabId);

            if ( tabIndex + 1 < tabsLength ) {
                this.openTab(this.tabs[tabIndex + 1]);
            } else {
                this.openFirstTab();
            }
        }

        if( event.keyCode == 37 ) {
            var tabId = event.target.id;
            var tabIndex = 0;
            var tabsLength = this.tabs.length;

            var tabIndex = this.getTabPosition(tabId);

            if ( tabIndex != 0 ) {
                this.openTab(this.tabs[tabIndex - 1]);
            } else {
                this.openLastTab();
            }
        }

    };

    // Returns the array position of a given tab.
    // See if there is any default function for this.
    Tabs.prototype.getTabPosition = function(tabId) {
        for( var i = 0; i < this.tabs.length; i++ ) {
            var tab = this.tabs[i];
            if( tabId == tab.getAttribute('id') ) {
                return i;
            }
        }
    };

    // Opens the first tab.
    Tabs.prototype.openFirstTab = function() {
        this.openTab(this.tabs[0]);
    };

    // Opens the last tab.
    Tabs.prototype.openLastTab = function() {
        this.openTab(this.tabs[this.tabs.length - 1]);
    };

    // Tab opening function goes here.
    Tabs.prototype.openTab = function(tab, setFocus) {

        var listitem = tab.parentElement;
        var tabId = tab.getAttribute('id');
        var panelId = listitem.getAttribute("aria-controls");
        
        for( var i = 0; i < this.tabs.length; i++ ) {
            var currentTab = this.tabs[i];

            if( currentTab.getAttribute('id') == tabId ) {
                this.activateTab(currentTab, setFocus);
            } else {
                this.deActivateTab(currentTab);
            }
        }

        for( var i = 0; i < this.panels.length; i++ ) {
            var panel = this.panels[i];

            if( panel.getAttribute('id') == panelId ) {
                this.activatePanel(panel);
            } else {
                this.deActivatePanel(panel);
            }
        }

    };

    // Activates the tab.
    Tabs.prototype.activateTab = function(tab, setFocus) {
        var needFocus = ( setFocus !== undefined ) ? setFocus : true;
        var listitem = tab.parentElement;

        listitem.setAttribute('aria-selected', 'true');
        listitem.setAttribute('aria-expanded', 'true');
        listitem.setAttribute('tabindex', '0');
        listitem.classList.add('th-ui-state-active');
        tab.setAttribute('tabindex', '-1');

        if ( needFocus ) {
            tab.focus();
        }
    }

    // Deactivates the tab.
    Tabs.prototype.deActivateTab = function(tab) {
        var listitem = tab.parentElement;

        listitem.setAttribute('aria-selected', 'false');
        listitem.setAttribute('aria-expanded', 'false');
        listitem.setAttribute('tabindex', '-1');
        listitem.classList.remove('th-ui-state-active');
        tab.setAttribute('tabindex', '-1');
    }

    // Activate the panel.
    Tabs.prototype.activatePanel = function(panel) {
        panel.style.display = 'block';
        panel.setAttribute('aria-hidden', 'false');
    }

    // Deactivate the panel.
    Tabs.prototype.deActivatePanel = function(panel) {
        panel.style.display = 'none';
        panel.setAttribute('aria-hidden', 'true');
    }

    // Traverse through the DOM and create Tabs instances for each tab widget.
    function init(elements) {
        var nodes = document.querySelectorAll(elements);
        if ( nodes == null ) {
            return;
        }
        for( var i = 0; i < nodes.length; i++ ) {
            var node = nodes[i];
            var tabs = new Tabs(node);
        }
    }

    init(".hm-featured-tabs");
    
})(); 