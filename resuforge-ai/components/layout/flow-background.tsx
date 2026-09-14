export function FlowBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* 主渐变层（极淡蓝色动画） */}
      <div className="absolute inset-0 bg-flow-large opacity-20" />

      {/* 浮动光斑 */}
      <div
        className="orb orb-blue animate-float"
        style={{
          width: '600px',
          height: '600px',
          top: '-200px',
          left: '-150px',
          animationDelay: '0s',
        }}
      />
      <div
        className="orb orb-ice animate-float"
        style={{
          width: '500px',
          height: '500px',
          bottom: '-150px',
          right: '-100px',
          animationDelay: '2s',
        }}
      />
      <div
        className="orb orb-white animate-float"
        style={{
          width: '400px',
          height: '400px',
          top: '40%',
          left: '60%',
          animationDelay: '4s',
        }}
      />

      {/* 网格点装饰 */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
}
