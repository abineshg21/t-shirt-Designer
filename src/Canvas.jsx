import { useEffect } from 'react';
import Konva from 'konva';
import { Stage, Layer, Rect, Line, Text, Image, Transformer } from 'react-konva';
import { W, H } from './products';
import { nearestInside } from './mockups';

export const measure = (el) => {
  if (el.type === 'image') return { w: el.w, h: el.h };
  const t = new Konva.Text({ text: el.text || ' ', fontFamily: el.fontFamily, fontSize: el.fontSize, fontStyle: el.fontStyle, textDecoration: el.deco });
  return { w: t.width(), h: t.height() };
};

// Linear gradient across the text box at a given angle (0 = left to right)
const gradient = (el, w, h) => {
  const a = (el.gAngle * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), r = (Math.abs(w * c) + Math.abs(h * s)) / 2;
  return { fillPriority: 'linear-gradient', fillLinearGradientStartPoint: { x: w / 2 - c * r, y: h / 2 - s * r },
    fillLinearGradientEndPoint: { x: w / 2 + c * r, y: h / 2 + s * r }, fillLinearGradientColorStops: [0, el.g1, 1, el.g2] };
};

export default function Canvas({ elements, selectedId, onSelect, onChange, shirt, bb, ppc, stageRef, shirtRef, guideRef, trRef }) {
  const cx = bb.x + bb.w / 2;
  useEffect(() => {
    const node = selectedId && stageRef.current.findOne('#' + selectedId);
    trRef.current.nodes(node ? [node] : []);
    trRef.current.getLayer().batchDraw();
  }, [selectedId, elements]);
  const deselect = (e) => { if (e.target === e.target.getStage()) onSelect(null); };

  return (
    <Stage width={W} height={H} ref={stageRef} onMouseDown={deselect} onTouchStart={deselect}>
      <Layer ref={shirtRef} listening={false}>
        <Rect width={W} height={H} fill="#eef1f3" />
        {shirt && <Image image={shirt.img} width={W} height={H} />}
      </Layer>
      <Layer ref={guideRef} listening={false}>
        <Line points={[cx, bb.y + 10, cx, bb.y + bb.h - 10]} stroke="#ff5a1f" opacity={0.45} dash={[4, 7]} strokeWidth={1} />
        {shirt && <Image image={shirt.outline} width={W} height={H} opacity={0.9} />}
        <Text x={bb.x + bb.w / 2 - 110} y={Math.max(2, bb.y - 16)} width={220} align="center" fontSize={11} fontFamily="Roboto" fill="#ff5a1f"
          text={`Print area: inside the T-shirt, ${(bb.w / ppc).toFixed(0)} × ${(bb.h / ppc).toFixed(0)} cm`} />
      </Layer>
      <Layer>
        {elements.map((el) => {
          const { w, h } = measure(el);
          const common = {
            id: el.id, x: el.x, y: el.y, rotation: el.rotation, scaleX: el.scale, scaleY: el.scale,
            offsetX: w / 2, offsetY: h / 2, draggable: true,
            dragBoundFunc: (pos) => nearestInside(shirt, pos.x, pos.y), // the design cannot leave the T-shirt
            onClick: () => onSelect(el.id), onTap: () => onSelect(el.id), onDragStart: () => onSelect(el.id),
            onDragMove: (e) => { if (Math.abs(e.target.x() - cx) < 5) e.target.x(cx); },
            onDragEnd: (e) => onChange(el.id, { x: e.target.x(), y: e.target.y() }),
            onTransformEnd: (e) => { const n = e.target; onChange(el.id, { x: n.x(), y: n.y(), rotation: n.rotation(), scale: n.scaleX() }); },
          };
          return el.type === 'image'
            ? <Image key={el.id} {...common} image={el.img} width={el.w} height={el.h} />
            : <Text key={el.id} {...common} text={el.text} fontFamily={el.fontFamily} fontSize={el.fontSize} fontStyle={el.fontStyle}
                textDecoration={el.deco} align="center" fill={el.fill} {...(el.fillMode === 'gradient' ? gradient(el, w, h) : {})} />;
        })}
        {/* everything above is trimmed to the shirt shape */}
        {shirt && <Image image={shirt.mask} width={W} height={H} globalCompositeOperation="destination-in" listening={false} />}
      </Layer>
      <Layer>
        <Transformer ref={trRef} rotateEnabled keepRatio rotationSnaps={[0, 90, 180, 270]} rotateAnchorOffset={28}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']} anchorSize={11}
          borderStroke="#ff5a1f" anchorStroke="#ff5a1f" anchorFill="#fff"
          boundBoxFunc={(o, n) => (n.width < 20 || n.height < 20 ? o : n)} />
      </Layer>
    </Stage>
  );
}
