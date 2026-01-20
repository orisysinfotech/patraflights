import React from "react";
import styled from "styled-components";

const Loader = () => {
  return (
    <Overlay>
      <div className="spinner">
        <span />
        <span />
        <span />
        <span />
      </div>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;

  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 9999;

  pointer-events: all;
  overflow: hidden;

  .spinner {
    --gap: 6px;
    --clr: #d62d20;
    --height: 26px;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--gap);
  }

  .spinner span {
    width: 6px;
    height: var(--height);
    background: var(--clr);
    border-radius: 4px;
    animation: grow 1s ease-in-out infinite;
    will-change: transform;
  }

  .spinner span:nth-child(2) {
    animation-delay: 0.15s;
  }

  .spinner span:nth-child(3) {
    animation-delay: 0.3s;
  }

  .spinner span:nth-child(4) {
    animation-delay: 0.45s;
  }

  @keyframes grow {
    0%,
    100% {
      transform: scaleY(1);
      opacity: 0.6;
    }

    50% {
      transform: scaleY(1.8);
      opacity: 1;
    }
  }
`;

export default Loader;
