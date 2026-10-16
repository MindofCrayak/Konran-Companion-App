import React from 'react';

export const BrandDecorations: React.FC = () => {
  return (
    <>
      {/* Top Ornamental Header Bar */}
      <div 
        className="absolute -top-[33px] left-1/2 -translate-x-1/2 rotate-180 w-[115%] h-[90px] bg-no-repeat bg-center bg-contain pointer-events-none z-10"
        style={{ backgroundImage: `url('https://i.imgur.com/SbzyxOw.png')` }}
        aria-hidden="true"
      />

      {/* Bottom Corner Ornaments */}
      <div 
        className="absolute -bottom-[40px] -right-[40px] w-[120px] h-[120px] rotate-180 bg-no-repeat bg-center bg-contain pointer-events-none z-10"
        style={{ backgroundImage: `url('https://i.imgur.com/AwdofV6.png')` }}
        aria-hidden="true"
      />
      <div 
        className="absolute -bottom-[40px] -left-[40px] w-[120px] h-[120px] rotate-[270deg] bg-no-repeat bg-center bg-contain pointer-events-none z-10"
        style={{ backgroundImage: `url('https://i.imgur.com/AwdofV6.png')` }}
        aria-hidden="true"
      />
    </>
  );
};
