# GRE Vocab Builder - Frontend

React + Vite frontend with Tailwind CSS.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Runs on http://localhost:3000

## Build for Production

```bash
npm run build
npm run preview
```

## Pages

1. **Dashboard** (`/`) - Statistics and quick actions
2. **Add Word** (`/add-word`) - Add new vocabulary with AI enrichment
3. **Vocabulary** (`/vocabulary`) - Browse and manage words
4. **Daily Quiz** (`/quiz`) - Adaptive quiz practice

## Tech Stack

- **React 18** - UI library
- **React Router** - Navigation
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - API calls

## Configuration

Backend API URL is configured in `src/services/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

For production, set `VITE_API_URL` environment variable.

