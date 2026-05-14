import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { RotateCw, Check, X } from 'lucide-react';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropDialogProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  aspectRatio?: number;
  onCropComplete: (blob: Blob) => void;
}

const ASPECT_RATIOS: Record<string, number | null> = {
  free: null,
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '1:1': 1,
};

export function ImageCropDialog({
  open,
  onClose,
  imageSrc,
  aspectRatio: initialAspectRatio,
  onCropComplete,
}: ImageCropDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [aspectKey, setAspectKey] = useState<string>(
    initialAspectRatio ? Object.entries(ASPECT_RATIOS).find(([, v]) => v === initialAspectRatio)?.[0] ?? 'free' : 'free',
  );
  const [dragging, setDragging] = useState<null | 'move' | 'nw' | 'ne' | 'sw' | 'se'>(null);
  const dragStart = useRef({ mx: 0, my: 0, crop: { x: 0, y: 0, width: 0, height: 0 } });

  const aspectValue = ASPECT_RATIOS[aspectKey] ?? null;

  // Load image and compute display dimensions
  useEffect(() => {
    if (!open || !imageSrc) return;
    setImgLoaded(false);
    setZoom(1);
    setRotation(0);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
      setImgLoaded(true);
    };
    img.src = imageSrc;
  }, [open, imageSrc]);

  // Recompute display size + initial crop when image loads or rotation changes
  useEffect(() => {
    if (!imgLoaded || !containerRef.current) return;
    const isRotated = rotation % 180 !== 0;
    const natW = isRotated ? imgSize.h : imgSize.w;
    const natH = isRotated ? imgSize.w : imgSize.h;

    const containerW = containerRef.current.clientWidth;
    const containerH = 400;
    const scale = Math.min(containerW / natW, containerH / natH, 1);
    const dw = Math.round(natW * scale);
    const dh = Math.round(natH * scale);
    setDisplaySize({ w: dw, h: dh });

    // Init crop to cover 80% of image
    const cw = Math.round(dw * 0.8);
    let ch = Math.round(dh * 0.8);
    if (aspectValue) {
      ch = Math.round(cw / aspectValue);
      if (ch > dh * 0.95) {
        const adj = Math.round(dh * 0.8);
        setCrop({
          x: Math.round((dw - adj * aspectValue) / 2),
          y: Math.round((dh - adj) / 2),
          width: Math.round(adj * aspectValue),
          height: adj,
        });
        return;
      }
    }
    setCrop({
      x: Math.round((dw - cw) / 2),
      y: Math.round((dh - ch) / 2),
      width: cw,
      height: ch,
    });
  }, [imgLoaded, imgSize, rotation, aspectValue]);

  // Enforce aspect ratio when aspect key changes
  useEffect(() => {
    if (!aspectValue || !displaySize.w) return;
    setCrop((prev) => {
      let { x, y, width, height } = prev;
      height = Math.round(width / aspectValue);
      if (y + height > displaySize.h) {
        height = displaySize.h - y;
        width = Math.round(height * aspectValue);
      }
      if (x + width > displaySize.w) {
        width = displaySize.w - x;
        height = Math.round(width / aspectValue);
      }
      return { x, y, width, height };
    });
  }, [aspectKey]);

  const clampCrop = useCallback(
    (c: CropArea): CropArea => {
      const minS = 20;
      let { x, y, width, height } = c;
      width = Math.max(minS, Math.min(width, displaySize.w));
      height = Math.max(minS, Math.min(height, displaySize.h));
      x = Math.max(0, Math.min(x, displaySize.w - width));
      y = Math.max(0, Math.min(y, displaySize.h - height));
      return { x, y, width, height };
    },
    [displaySize],
  );

  const handlePointerDown = useCallback(
    (type: 'move' | 'nw' | 'ne' | 'sw' | 'se', e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(type);
      dragStart.current = { mx: e.clientX, my: e.clientY, crop: { ...crop } };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [crop],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      const s = dragStart.current.crop;

      if (dragging === 'move') {
        setCrop(clampCrop({ x: s.x + dx, y: s.y + dy, width: s.width, height: s.height }));
        return;
      }

      let nx = s.x,
        ny = s.y,
        nw = s.width,
        nh = s.height;

      if (dragging === 'se') {
        nw = s.width + dx;
        nh = aspectValue ? nw / aspectValue : s.height + dy;
      } else if (dragging === 'sw') {
        nw = s.width - dx;
        nx = s.x + dx;
        nh = aspectValue ? nw / aspectValue : s.height + dy;
      } else if (dragging === 'ne') {
        nw = s.width + dx;
        nh = aspectValue ? nw / aspectValue : s.height - dy;
        if (!aspectValue) ny = s.y + dy;
      } else if (dragging === 'nw') {
        nw = s.width - dx;
        nx = s.x + dx;
        nh = aspectValue ? nw / aspectValue : s.height - dy;
        if (!aspectValue) ny = s.y + dy;
      }

      if (aspectValue && (dragging === 'nw' || dragging === 'ne')) {
        ny = s.y + s.height - nh;
      }

      setCrop(clampCrop({ x: nx, y: ny, width: nw, height: nh }));
    },
    [dragging, aspectValue, clampCrop],
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleConfirm = useCallback(() => {
    if (!imgRef.current || !displaySize.w) return;
    const isRotated = rotation % 180 !== 0;
    const natW = isRotated ? imgSize.h : imgSize.w;
    const natH = isRotated ? imgSize.w : imgSize.h;
    const scaleX = (natW / displaySize.w) * (1 / zoom);
    const scaleY = (natH / displaySize.h) * (1 / zoom);

    // Source coordinates in the zoomed/rotated image space
    const sx = crop.x * scaleX;
    const sy = crop.y * scaleY;
    const sw = crop.width * scaleX;
    const sh = crop.height * scaleY;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(crop.width * scaleX * zoom);
    canvas.height = Math.round(crop.height * scaleY * zoom);
    const ctx = canvas.getContext('2d')!;

    // Apply rotation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const img = imgRef.current;
    let drawW: number, drawH: number;
    if (rotation % 180 !== 0) {
      drawW = (imgSize.w / natW) * canvas.width;
      drawH = (imgSize.h / natH) * canvas.height;
    } else {
      drawW = canvas.width;
      drawH = canvas.height;
    }

    // Draw the source portion
    ctx.drawImage(
      img,
      rotation === 0
        ? sx
        : rotation === 90
          ? sy
          : rotation === 180
            ? imgSize.w - sx - sw
            : imgSize.h - sy - sh,
      rotation === 0
        ? sy
        : rotation === 90
          ? imgSize.h - sx - sw
          : rotation === 180
            ? imgSize.h - sy - sh
            : sx,
      rotation % 180 === 0 ? sw : sh,
      rotation % 180 === 0 ? sh : sw,
      -drawW / 2,
      -drawH / 2,
      drawW,
      drawH,
    );
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      'image/webp',
      0.92,
    );
  }, [crop, displaySize, imgSize, rotation, zoom, onCropComplete]);

  const handleSize = 10;
  const Handle = ({ pos, onDown }: { pos: 'nw' | 'ne' | 'sw' | 'se'; onDown: (type: typeof pos, e: React.PointerEvent) => void }) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      width: handleSize,
      height: handleSize,
      background: 'hsl(var(--primary))',
      border: '2px solid hsl(var(--primary-foreground))',
      borderRadius: 2,
      ...(pos.includes('n') ? { top: -handleSize / 2 } : { bottom: -handleSize / 2 }),
      ...(pos.includes('w') ? { left: -handleSize / 2 } : { right: -handleSize / 2 }),
      cursor:
        pos === 'nw' || pos === 'se' ? 'nwse-resize' : 'nesw-resize',
      zIndex: 10,
      touchAction: 'none',
    };
    return <div style={style} onPointerDown={(e) => onDown(pos, e)} />;
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Recortar imagem</DialogTitle>
          <DialogDescription>Arraste a área de recorte e ajuste o zoom antes de confirmar.</DialogDescription>
        </DialogHeader>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <ToggleGroup
            type="single"
            value={aspectKey}
            onValueChange={(v) => v && setAspectKey(v)}
            size="sm"
          >
            {Object.keys(ASPECT_RATIOS).map((k) => (
              <ToggleGroupItem key={k} value={k} className="text-xs px-2">
                {k === 'free' ? 'Livre' : k}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Button type="button" size="sm" variant="outline" onClick={handleRotate}>
            <RotateCw className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 ml-auto min-w-[140px]">
            <span className="text-xs text-muted-foreground">Zoom</span>
            <Slider
              min={100}
              max={300}
              step={10}
              value={[zoom * 100]}
              onValueChange={([v]) => setZoom(v / 100)}
              className="w-24"
            />
            <span className="text-xs text-muted-foreground w-8">{Math.round(zoom * 100)}%</span>
          </div>
        </div>

        {/* Canvas area */}
        <div
          ref={containerRef}
          className="relative mx-auto select-none overflow-hidden rounded-lg bg-muted/40 border border-border"
          style={{ width: '100%', height: 400 }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {imgLoaded && (
            <>
              <img
                src={imageSrc}
                alt=""
                draggable={false}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: displaySize.w * zoom,
                  height: displaySize.h * zoom,
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  pointerEvents: 'none',
                  objectFit: 'contain',
                }}
              />

              {/* Dark overlay – 4 rects around the crop area */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                }}
              >
                {/* Derive crop position relative to container center */}
                {(() => {
                  const ox = (containerRef.current?.clientWidth ?? 0) / 2 - (displaySize.w * zoom) / 2;
                  const oy = 200 - (displaySize.h * zoom) / 2;
                  const cx = ox + crop.x * zoom;
                  const cy = oy + crop.y * zoom;
                  const cw = crop.width * zoom;
                  const ch = crop.height * zoom;
                  const fw = containerRef.current?.clientWidth ?? 0;
                  const fh = 400;
                  return (
                    <>
                      <div className="bg-black/50" style={{ position: 'absolute', top: 0, left: 0, width: fw, height: Math.max(0, cy) }} />
                      <div className="bg-black/50" style={{ position: 'absolute', top: cy + ch, left: 0, width: fw, height: Math.max(0, fh - cy - ch) }} />
                      <div className="bg-black/50" style={{ position: 'absolute', top: cy, left: 0, width: Math.max(0, cx), height: ch }} />
                      <div className="bg-black/50" style={{ position: 'absolute', top: cy, left: cx + cw, width: Math.max(0, fw - cx - cw), height: ch }} />
                    </>
                  );
                })()}
              </div>

              {/* Crop area */}
              {(() => {
                const ox = (containerRef.current?.clientWidth ?? 0) / 2 - (displaySize.w * zoom) / 2;
                const oy = 200 - (displaySize.h * zoom) / 2;
                return (
                  <div
                    style={{
                      position: 'absolute',
                      left: ox + crop.x * zoom,
                      top: oy + crop.y * zoom,
                      width: crop.width * zoom,
                      height: crop.height * zoom,
                      border: '2px solid hsl(var(--primary))',
                      cursor: 'move',
                      touchAction: 'none',
                    }}
                    onPointerDown={(e) => handlePointerDown('move', e)}
                  >
                    <Handle pos="nw" onDown={handlePointerDown} />
                    <Handle pos="ne" onDown={handlePointerDown} />
                    <Handle pos="sw" onDown={handlePointerDown} />
                    <Handle pos="se" onDown={handlePointerDown} />
                  </div>
                );
              })()}
            </>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm}>
            <Check className="h-4 w-4 mr-1" />
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
