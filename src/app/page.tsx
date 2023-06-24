"use client";

import { useEffect, useMemo, useState } from 'react'

export default function Home() {
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });
  const [shakeCount, setShakeCount] = useState(0);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  useEffect(() => {
    if(!isPermissionGranted) return;
    const listener = (event: DeviceMotionEvent) => {
      const { x, y, z } = event.acceleration || { x: 0, y: 0, z: 0};
      if(Math.abs(x ?? 0) + Math.abs(y ?? 0) + Math.abs(z ?? 0) > 15) {
        if(
          Math.sign(x ?? 0) !== Math.sign(acceleration.x ?? 0)
          || Math.sign(y ?? 0) !== Math.sign(acceleration.y ?? 0)
          || Math.sign(z ?? 0) !== Math.sign(acceleration.z ?? 0)
        ) {
          setShakeCount(shakeCount + 1);

          if(timeoutId) window.clearTimeout(timeoutId);
          setTimeoutId(window.setTimeout(() => {
            setShakeCount(0);
            setTimeoutId(null);
          }, 3000));
        }
      }
      setAcceleration({ x: x ?? 0, y: y ?? 0, z: z ?? 0 });
    };
    window.addEventListener("devicemotion", listener)
    return () => { window.removeEventListener("devicemotion", listener)}
  }, [isPermissionGranted]);

  const requestPermission = async () => {
    const result = await (DeviceMotionEvent as any).requestPermission();
    setIsPermissionGranted(result === "granted");
  }

  useEffect(() => {
    if (
      (window.DeviceMotionEvent as any)?.requestPermission
    ) {
      (DeviceMotionEvent as any).requestPermission().then((result: string) => setIsPermissionGranted(result === "granted"))
    } else {
      setIsPermissionGranted(true);
    }
  }, []);


  const clipPath = useMemo(() => {
    const ratio = (1 - Math.min(1, shakeCount / 20)) * 100;
    return `polygon(0 ${ratio}%, 100% ${ratio}%, 100% 100%, 0 100%)`
  }, [shakeCount])

  return <main className="relative w-screen h-screen">
    <div className="z-0 absolute w-full h-full transition-all"  style={{ backgroundColor: "#EE8000", clipPath }} />
    <div className="z-10 absolute w-full h-full flex flex-col items-center justify-center">
      {
        isPermissionGranted ? (
          <div className="flex flex-col gap-4 items-center">
            <h1 className="text-2xl">加速度</h1>
            <table>
              <tbody>
                <tr>
                  <th className="px-4">X</th>
                  <td className="px-4">{acceleration.x}</td>
                </tr>
                <tr>
                  <th className="px-4">Y</th>
                  <td className="px-4">{acceleration.y}</td>
                </tr>
                <tr>
                  <th className="px-4">Z</th>
                  <td className="px-4">{acceleration.z}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-4xl top-1/2 left-1/2">{shakeCount}</p>
          </div>
        ) : (
          <button onClick={requestPermission} className="px-4 py-2 border border-orange-700 text-orange-700 rounded hover:bg-orange-50 select-none">&quot;動作と方向&quot;へのアクセスを許可する</button>
        )}
    </div>
  </main>
}
