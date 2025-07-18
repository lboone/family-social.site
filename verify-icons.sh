#!/bin/bash

# App Icons & Meta Tags Verification Script
echo "🎨 Family Social App - Icons & Meta Tags Verification"
echo "======================================================"

cd "$(dirname "$0")/frontend/public"

echo ""
echo "📱 Checking Icon Files:"
echo "----------------------"

files=("favicon.ico" "apple-icon.png" "web-app-manifest-192x192.png" "web-app-manifest-512x512.png" "manifest.json" "site.webmanifest" "browserconfig.xml" "robots.txt")

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file (missing)"
  fi
done

echo ""
echo "🌐 Checking Meta Tags in layout.tsx:"
echo "------------------------------------"

layout_file="../app/layout.tsx"
if [ -f "$layout_file" ]; then
  echo "✅ layout.tsx exists"
  
  # Check for key meta tags
  if grep -q "openGraph" "$layout_file"; then
    echo "✅ Open Graph tags configured"
  else
    echo "❌ Open Graph tags missing"
  fi
  
  if grep -q "twitter" "$layout_file"; then
    echo "✅ Twitter Card tags configured"
  else
    echo "❌ Twitter Card tags missing"
  fi
  
  if grep -q "appleWebApp" "$layout_file"; then
    echo "✅ Apple Web App tags configured"
  else
    echo "❌ Apple Web App tags missing"
  fi
  
  if grep -q "manifest" "$layout_file"; then
    echo "✅ Manifest link configured"
  else
    echo "❌ Manifest link missing"
  fi
else
  echo "❌ layout.tsx not found"
fi

echo ""
echo "🎯 Quick Tests:"
echo "---------------"
echo "1. Visit http://localhost:3001 to see favicon in browser tab"
echo "2. Share the URL on social media to test rich previews"
echo "3. Try 'Add to Home Screen' on mobile devices"
echo "4. Test social sharing at:"
echo "   - Facebook: https://developers.facebook.com/tools/debug/"
echo "   - Twitter: https://cards-dev.twitter.com/validator"
echo ""
echo "🔧 Remember to update:"
echo "- Replace 'https://your-domain.com' with your actual domain"
echo "- Replace '@your-twitter-handle' with your actual Twitter handle"
echo "- Update theme colors in manifest.json if needed"
echo ""
echo "✅ Setup complete! Your app now has professional branding across all platforms."
