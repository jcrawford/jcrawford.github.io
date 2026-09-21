import React from "react";
import PostMediaImage from "./PostMediaImage";
import type { RecipeStep } from "../types/article";

export interface RecipeStepsProps {
  steps: RecipeStep[];
  variant?: "article" | "recipe";
}

const RecipeSteps: React.FC<RecipeStepsProps> = ({ steps, variant = "article" }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="recipe-steps">
      <h2>Instructions</h2>
      {steps.map((step, index) => (
        <div key={index} className="recipe-step watermark-step">
          {variant === "article" ? (
            <div className="watermark-number">{index + 1}</div>
          ) : (
            <span className="watermark-number">{index + 1}</span>
          )}
          <div className="recipe-step-content">
            <h3>{step.title}</h3>
            <p>{step.description}</p>
            {variant === "recipe" && step.video && (
              <div className="recipe-step-video">
                <video controls playsInline muted loop>
                  <source src={step.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            {step.image && (
              <div className="recipe-step-image">
                <PostMediaImage src={step.image} alt={step.title} />
              </div>
            )}
            {variant === "article" && step.video && (
              <div className="recipe-step-video">
                <video controls preload="metadata">
                  <source src={step.video} type="video/mp4" />
                </video>
              </div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
};

export default RecipeSteps;
