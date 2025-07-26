#!/bin/bash

# PDF Import Feature Test Script
# This script helps verify that the PDF import functionality is working correctly

echo "🧪 Testing PDF Import Feature Setup"
echo "=================================="

# Check if PDF worker file exists
if [ -f "public/pdf.worker.min.mjs" ]; then
    echo "✅ PDF worker file found in public directory"
    echo "   Size: $(ls -lh public/pdf.worker.min.mjs | awk '{print $5}')"
else
    echo "❌ PDF worker file missing! Run: cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/"
    exit 1
fi

# Check if pdfjs-dist is installed
if [ -d "node_modules/pdfjs-dist" ]; then
    echo "✅ PDF.js library installed"
    echo "   Version: $(cat node_modules/pdfjs-dist/package.json | grep '"version"' | head -1 | cut -d '"' -f 4)"
else
    echo "❌ PDF.js library not found! Run: npm install pdfjs-dist"
    exit 1
fi

# Check if PDF utils file exists
if [ -f "src/lib/pdf-utils.ts" ]; then
    echo "✅ PDF utilities file exists"
else
    echo "❌ PDF utilities file missing!"
    exit 1
fi

# Check if new chapter page has been updated
if grep -q "convertPDFToImages" "src/app/admin/comics/[id]/chapters/new/page.tsx"; then
    echo "✅ New chapter page updated with PDF functionality"
else
    echo "❌ New chapter page not updated with PDF functionality"
    exit 1
fi

echo ""
echo "🎉 All checks passed! PDF import feature should be working."
echo ""
echo "To test:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Go to Admin > Comics > [Select a comic] > Add New Chapter"
echo "3. Try uploading a PDF file using the blue 'Upload PDF' section"
echo "4. The PDF should be automatically split into individual page images"
echo ""
echo "Troubleshooting:"
echo "- If you get worker errors, check browser console"
echo "- Make sure the PDF file is not password-protected"
echo "- Try with smaller PDF files first (< 10MB)"
echo "- Check that JavaScript is enabled in your browser"
