# Welcome to CDB Estimator!

A web app to estimate Canada Disability Benefit amount

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:3000/`.

run checks with:

```bash
npm run checks
```

run tests with:

```bash
npm run test
```

run end to end (e2e) tests with:

```bash
npm run test:e2e
```

update test snapshots with:

```bash
npm run test:e2e -- -u
```

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
# with docker
docker build --tag cdb-estimator-frontend --file containerfile .
docker run --init --interactive --tty --rm --network host --env-file .env --name cdb-estimator-frontend cdb-estimator-frontend

# with podman
podman build --tag cdb-estimator-frontend --file containerfile .
podman run --init --interactive --tty --rm --network host --env-file .env --name cdb-estimator-frontend cdb-estimator-frontend
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
