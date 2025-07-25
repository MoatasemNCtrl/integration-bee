# 🐝 Integration Bee

A web application that turns integration problems into an engaging game, similar to chess.com's puzzle rush. Practice calculus integration with AI-powered solution validation using your drawing board!

## ✨ Features

- **🎮 Multiple Game Modes**: 3-minute, 5-minute, and unlimited time modes
- **📝 Drawing Canvas**: Solve problems by hand using the interactive drawing board
- **🤖 AI Validation**: Solutions are checked using OpenAI's GPT-4 Vision API
- **📊 Progress Tracking**: Detailed statistics and performance analytics
- **🎯 Difficulty Progression**: Start with basic integrals and advance to complex problems
- **💡 Hint System**: Get helpful hints when you're stuck
- **📚 Practice Mode**: Study problems at your own pace with solutions
- **🔥 Streak System**: Build up solving streaks for extra motivation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd integration-bee
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Play

1. **Choose a Game Mode**: Select from 3-minute, 5-minute, or unlimited time
2. **Solve the Integral**: Use the drawing canvas to write your solution by hand
3. **Submit Your Answer**: Click submit to have AI validate your solution
4. **Progress Through Difficulties**: Start with basic problems and advance to intermediate and advanced levels
5. **Build Your Streak**: Solve consecutive problems correctly to build your streak
6. **Track Your Progress**: View detailed statistics on your performance

## 🧮 Problem Types

### Basic Level
- Power rule integrals
- Simple exponential and trigonometric functions
- Basic logarithmic integrals

### Intermediate Level
- Integration by parts
- Trigonometric integrals
- Substitution method problems

### Advanced Level
- Multiple integration by parts
- Complex trigonometric identities
- Advanced substitution techniques

## 🎨 Drawing Features

- **Pen Tool**: Write your mathematical solution
- **Eraser Tool**: Correct mistakes
- **Clear Canvas**: Start over completely
- **Responsive Canvas**: Works on desktop and tablet devices

## 📊 Statistics Tracking

- Total problems attempted and solved
- Accuracy rate by difficulty level
- Best streak records
- Session history
- Performance trends

## 🔧 Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Math Rendering**: KaTeX
- **AI Integration**: OpenAI GPT-4 Vision API
- **Canvas Drawing**: HTML5 Canvas API

## 🤖 AI Solution Validation

The app uses OpenAI's GPT-4 Vision model to:
- Analyze handwritten mathematical solutions
- Recognize different notation styles
- Accept mathematically equivalent answers
- Provide feedback on incorrect solutions

## 📝 API Endpoints

- `POST /api/validate` - Validate handwritten solutions using AI
- `GET /api/stats` - Retrieve user statistics
- `POST /api/stats` - Update user statistics
- `DELETE /api/stats` - Reset statistics (development)

## 🛠️ Development

### Project Structure
```
app/
├── api/                 # API routes
├── components/          # React components
├── rush/               # Game modes
├── practice/           # Practice mode
├── stats/              # Statistics dashboard
└── page.tsx            # Main menu

lib/
├── integral-database.ts # Problem database
└── utils.ts            # Utility functions

components/ui/          # UI component library
```

### Adding New Problems

Problems are defined in `lib/integral-database.ts`. Each problem includes:
- LaTeX-formatted problem statement
- Expected solution
- Difficulty level
- Helpful hints
- Alternative solution forms

### Customizing AI Validation

The validation logic is in `app/api/validate/route.ts`. You can modify:
- Prompt engineering for better recognition
- Confidence thresholds
- Alternative answer checking

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
The app is a standard Next.js application and can be deployed on:
- Netlify
- Heroku
- AWS Amplify
- DigitalOcean App Platform

## 🎯 Future Enhancements

- [ ] Database integration for persistent user accounts
- [ ] Multiplayer tournaments
- [ ] More advanced problem types (definite integrals, substitution)
- [ ] Mobile app version
- [ ] Social features and leaderboards
- [ ] Integration with LMS platforms
- [ ] Voice-to-text problem input
- [ ] Step-by-step solution guides

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for the powerful GPT-4 Vision API
- The math education community for inspiration
- KaTeX for beautiful math rendering
- The Next.js team for an excellent framework

## 🐛 Known Issues

- Canvas drawing is optimized for desktop/tablet use
- Some complex mathematical notation may not be perfectly recognized
- AI validation requires stable internet connection

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-username/integration-bee/issues) page
2. Create a new issue with detailed description
3. Include steps to reproduce the problem

---

**Happy integrating! 🐝✨**
