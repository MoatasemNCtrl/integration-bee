#!/bin/bash

echo "🔑 OpenAI API Key Setup"
echo "======================"
echo ""
echo "Please enter your OpenAI API key (starts with sk-...):"
echo "Get it from: https://platform.openai.com/api-keys"
echo ""
read -p "API Key: " api_key

if [[ $api_key == sk-* ]]; then
    # Replace the placeholder in .env.local
    sed -i '' "s/your_openai_api_key_here/$api_key/" .env.local
    echo ""
    echo "✅ API key configured successfully!"
    echo "🔄 Restarting the development server..."
    echo ""
    
    # Find and kill the existing dev server
    pkill -f "next dev"
    sleep 2
    
    # Start the dev server again
    npm run dev &
    
    echo "🚀 Server restarted! The app should now work properly."
    echo "📱 Visit: http://localhost:3000"
else
    echo "❌ Invalid API key format. Please make sure it starts with 'sk-'"
    exit 1
fi
