#!/bin/bash

# Travel articles (001, 011, 016)
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200\&h=800\&fit=crop"|' 001-*.json
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200\&h=800\&fit=crop"|' 011-*.json
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200\&h=800\&fit=crop"|' 016-*.json
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200\&h=800\&fit=crop"|' 017-*.json

# Fashion articles (002, 003, 004, 005)
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200\&h=800\&fit=crop"|' 002-*.json
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200\&h=800\&fit=crop"|' 003-*.json
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200\&h=800\&fit=crop"|' 004-*.json
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=1200\&h=800\&fit=crop"|' 005-*.json

# Lifestyle articles (006, 007, 008, 009)
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200\&h=800\&fit=crop"|' 006-*.json
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200\&h=800\&fit=crop"|' 007-*.json
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200\&h=800\&fit=crop"|' 008-*.json
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=1200\&h=800\&fit=crop"|' 009-*.json

# Food articles (010, 012, 013, 014)
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200\&h=800\&fit=crop"|' 010-*.json
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200\&h=800\&fit=crop"|' 012-*.json
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200\&h=800\&fit=crop"|' 013-*.json
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200\&h=800\&fit=crop"|' 014-*.json

# Sports articles (015, 018, 019, 020)
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200\&h=800\&fit=crop"|' 015-*.json
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200\&h=800\&fit=crop"|' 018-*.json
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200\&h=800\&fit=crop"|' 019-*.json
sed -i '' 's|"featuredImage": "https://placehold.co/1200x800.*|"featuredImage": "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200\&h=800\&fit=crop"|' 020-*.json

echo "✅ Updated all article images with real Unsplash photos"
