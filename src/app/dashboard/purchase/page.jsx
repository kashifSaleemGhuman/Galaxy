"use client";

import { useState } from "react";

import { PurchaseHome } from "./_components/PurchaseHome";
import GetStartedForm from "./_components/GetStartedForm";
import Dasboard from "./_components/Dasboard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function PurchaseOverviewPage() {
  const Steps = {
    HOME: "home",
    GET_STARTED: "get-started",
    DASHBOARD: "dashboard",
  };

  const [currentStep, setCurrentStep] = useState(Steps.HOME);

  const breadcrumbs = [
    { key: Steps.HOME, label: "Purchase" },
    ...(currentStep !== Steps.HOME
      ? [{ key: Steps.GET_STARTED, label: "Get Started" }]
      : []),
    ...(currentStep === Steps.DASHBOARD
      ? [{ key: Steps.DASHBOARD, label: "Dashboard" }]
      : []),
  ];

  const handleBreadcrumbNavigate = (index, item) => {
    setCurrentStep(item.key);
  };

  const handleStartNow = () => {
    setCurrentStep(Steps.GET_STARTED);
  };

  const handleFormCompleted = () => {
    setCurrentStep(Steps.DASHBOARD);
  };

  return (
    <>
      <Breadcrumbs items={breadcrumbs} onNavigate={handleBreadcrumbNavigate} />

      {currentStep === Steps.DASHBOARD ? (
        <Dasboard />
      ) : currentStep === Steps.GET_STARTED ? (
        <GetStartedForm onStartNow={handleFormCompleted} />
      ) : (
        <div>
          <PurchaseHome onStartNow={handleStartNow} />
        </div>
      )}
    </>
  );
}
