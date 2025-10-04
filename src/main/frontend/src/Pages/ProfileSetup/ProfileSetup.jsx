import { useEffect, useState } from "react";
import Rules from "./Rules";
import Name from "./Name";
import Birthday from "./Birthday";
import Gender from "./Gender";
import Interests from "./Interests";
import Lifestyle from "./Lifestyle";
import Photos from "./Photos";
import ProgressBar from "./ProgressBar"; // 🌈 Your animated one

const steps = [
	"rules",
	"name",
	"birthday",
	"gender",
	"interests",
	"lifestyle",
	"photos"
];

export default function ProfileSetup() {
	const [currentStep, setCurrentStep] = useState(() => {
		const savedStep = localStorage.getItem("profile_current_step");
		return steps.includes(savedStep) ? savedStep : "rules";
	});

	useEffect(() => {
		localStorage.setItem("profile_current_step", currentStep);
	}, [currentStep]);

	const next = () => {
		const currentIndex = steps.indexOf(currentStep);
		const nextStep = steps[currentIndex + 1];
		if (nextStep) setCurrentStep(nextStep);
	};

	const back = () => {
		const currentIndex = steps.indexOf(currentStep);
		const prevStep = steps[currentIndex - 1];
		if (prevStep) setCurrentStep(prevStep);
	};

	const currentStepIndex = steps.indexOf(currentStep);

	return (
		<>
			{/* 🌟 Show progress bar only after rules */}
			{currentStep !== "rules" && (
				<ProgressBar step={currentStepIndex} totalSteps={steps.length} />
			)}

			{currentStep === "rules" && <Rules next={next} />}
			{currentStep === "name" && <Name next={next} back={back} />}
			{currentStep === "birthday" && <Birthday next={next} back={back} />}
			{currentStep === "gender" && <Gender next={next} back={back} />}
			{currentStep === "interests" && <Interests next={next} back={back} />}
			{currentStep === "lifestyle" && <Lifestyle next={next} back={back} />}
			{currentStep === "photos" && <Photos back={back} />}
		</>
	);
}
