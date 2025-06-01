# DeFi Analytics Platform

A modern web application for analyzing DeFi protocols and pools, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Real-time DeFi pool data from DeFiLlama API
- Detailed pool information including APY, volatility, and Sharpe ratio
- Protocol details with TVL, contract age, and audit status
- Project reputation scoring
- Exploit history tracking
- Responsive design with modern UI components

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Zustand for state management
- SWR for data fetching

## Getting Started

1. Clone the repository:
```bash
git clone git@github.com:0xbrowser/spade-frontend.git
cd spade-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  ├── app/                 # Next.js app directory
  │   └── page.tsx        # Dashboard page
  ├── components/         # Reusable components
  │   └── Header.tsx     # Header component
  ├── store/             # State management
  │   └── defiStore.ts   # Zustand store
  └── utils/             # Utility functions
```

## API Integration

The application integrates with two main DeFiLlama APIs:

1. Yields API: `https://yields.llama.fi/pools`
   - Provides pool data including APY, volatility, and Sharpe ratio

2. Protocol API: `https://api.llama.fi/protocol/{protocol}`
   - Provides detailed protocol information including TVL, contract age, and exploit history

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
