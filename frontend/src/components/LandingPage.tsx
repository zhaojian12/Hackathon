import React from 'react';
import Spline from '@splinetool/react-spline';
import './LandingPage.css';

interface LandingPageProps {
  onEnter: () => void;
}

/**
 * Landing Page Component with Spline 3D Scene
 * Displays the main entry page with 3D interactive scene
 */
export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  /**
   * Spline 鼠标按下事件处理
   */
  function onSplineMouseDown(e: any) {
    if (e?.target) {
      // reserved for future interactions
    }
  }

  /**
   * Spline 点击事件处理
   */
  function onSplineClick(e: any) {
    if (e.target) {
      onEnter();
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onEnter();
    }
  };

  return (
    <div className="landing-page">
      {/* Spline 3D 场景 */}
      <Spline
        style={{ width: "100%", height: "100%" }}
        scene="/scene6.splinecode"
        onMouseDown={onSplineMouseDown}
        onClick={onSplineClick}
      />
      
      {/* 可点击的透明按钮区域 - 覆盖在 3D 场景的按钮位置上 */}
      <div 
        role="button"
        tabIndex={0}
        onClick={onEnter}
        onKeyDown={handleKeyDown}
        className="landing-clickable-area"
        aria-label="Enter Application"
      />
    </div>
  );
};
