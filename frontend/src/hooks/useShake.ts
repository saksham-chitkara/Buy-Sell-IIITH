import { useState, useCallback } from 'react';

const useShake = (duration = 500) => {
  const [isShaking, setIsShaking] = useState(false);

  const shake = useCallback(() => {
    if (!isShaking) {
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
      }, duration);
    }
  }, [duration, isShaking]);

  return {
    isShaking,
    shake,
    setIsShaking,
    className: isShaking ? 'animate-shake' : '',
  };
};

export default useShake;
