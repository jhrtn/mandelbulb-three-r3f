Mandelbulb point cloud created with three.js/react-three-fiber. Ported from Processing code by Daniel Shiffman of The Coding Train: https://thecodingtrain.com/CodingChallenges/168-mandelbulb.html

This utilises a web worker to do the heavy lifting of the point generation on a separate thread without locking up the UI. This means we can show a nice loading animation whilst the points are generated and send messages to regenerate the point coordinates.

mandelbulb web worker code: https://github.com/jhrtn/mandelbulb-three-r3f/blob/dev/src/lib/points-worker.ts

3d/interface code: https://github.com/jhrtn/mandelbulb-three-r3f/blob/dev/src/App.tsx

try it: https://mandelbulb-three-r3f.vercel.app/


Much of what I know about custom points shaders in three.js comes from this livestream by Yuri Aritukh: https://www.youtube.com/watch?v=qLh12Aav3hs&t=2158s


![Screenshot 2022-03-12 at 16 52 20](https://user-images.githubusercontent.com/17256474/158027258-fea37ba9-4473-40e7-a9df-792b2f7f92e1.png)
