"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import * as React from "react"

interface Step {
  id: string
  title: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (step: number) => void
  className?: string
}

export function Stepper({ steps, currentStep, onStepClick, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isClickable = onStepClick && index <= currentStep

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isCompleted && "border-primary bg-primary text-primary-foreground",
                    isCurrent && !isCompleted && "border-primary bg-background text-primary",
                    !isCurrent && !isCompleted && "border-muted-foreground/25 bg-background text-muted-foreground",
                    isClickable && "cursor-pointer hover:border-primary/50",
                    !isClickable && "cursor-not-allowed"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </button>
                <div className="mt-2 text-center">
                  <p className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-primary",
                    !isCurrent && "text-muted-foreground"
                  )}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4",
                  isCompleted ? "bg-primary" : "bg-muted-foreground/25"
                )} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
