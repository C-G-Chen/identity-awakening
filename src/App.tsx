import { IdentityContext, useIdentityData } from './hooks/useIdentityData'
import StepNav from './components/StepNav'
import HeroSection from './components/HeroSection'
import SelfExploration from './components/SelfExploration'
import AntiVisionBuilder from './components/AntiVisionBuilder'
import GoalSetter from './components/GoalSetter'
import InterruptReminder from './components/InterruptReminder'
import GamifyLife from './components/GamifyLife'
import ManifestoExport from './components/ManifestoExport'

function App() {
  const identityData = useIdentityData()
  const { currentStep } = identityData.data

  return (
    <IdentityContext.Provider value={identityData}>
      <div className="min-h-screen bg-background-DEFAULT text-white overflow-x-hidden">
        {/* Step navigation (hidden on hero) */}
        <StepNav />

        {/* Ambient background blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-3xl" />
        </div>

        {/* Main content: single-step view */}
        <main className="relative z-10">
          {currentStep === 0 && <HeroSection />}
          {currentStep === 1 && <SelfExploration />}
          {currentStep === 2 && <AntiVisionBuilder />}
          {currentStep === 3 && <GoalSetter />}
          {currentStep === 4 && <InterruptReminder />}
          {currentStep === 5 && <GamifyLife />}
          {currentStep === 6 && <ManifestoExport />}
        </main>
      </div>
    </IdentityContext.Provider>
  )
}

export default App
