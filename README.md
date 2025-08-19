# DDoS Tracker

A real-time 3D visualization of DDoS attacks across the globe using React and react-globe.gl.

## Features

- Real-time visualization of DDoS attacks between major global cities
- Animated attack arcs with source points and labels
- Interactive 3D globe with night earth texture
- Responsive design that works on all devices

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
cd client
npm install
```

### Running the Development Server

```bash
cd client
npm run dev
```

### Building for Production

```bash
cd client
npm run build
```

## Deployment

This project is configured for deployment on Netlify. Simply connect your repository to Netlify and it will automatically build and deploy.

## Dependencies

- [react-globe.gl](https://github.com/vasturiano/react-globe.gl) - React component for 3D globe visualization
- [three.js](https://threejs.org/) - 3D library used by react-globe.gl
- [React](https://reactjs.org/) - JavaScript library for building user interfaces

## License

MIT