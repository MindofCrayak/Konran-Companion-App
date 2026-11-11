/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SlabletDesktop } from './components/SlabletDesktop';

export default function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-[#020205] relative select-none">
      {/* Pure Spatial Node Operating Desktop - All experiences reside in nodes */}
      <SlabletDesktop />
    </div>
  );
}
