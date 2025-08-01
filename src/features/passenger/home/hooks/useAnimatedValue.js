"use client"

import { useMemo } from "react"
import { Animated } from "react-native"

export const useAnimatedValue = (initialValue = 0) => {
  const animatedValue = useMemo(() => new Animated.Value(initialValue), [initialValue])
  return animatedValue
}
