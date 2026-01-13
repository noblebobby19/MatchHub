import { useNavigate } from "react-router-dom";
import { HeroSection } from "../components/HeroSection";
import { NotificationBanner } from "../components/NotificationBanner";
import { PopularFieldsSection } from "../components/PopularFieldsSection";
import { FeaturesSection } from "../components/FeaturesSection";


export function HomePage() {
  const navigate = useNavigate();

  return (
    <main>
      <HeroSection onSearchClick={() => navigate('/tim-san')} />
      <NotificationBanner />
      <PopularFieldsSection 
        onFieldClick={(fieldId) => navigate(`/san-bong/${fieldId}`)}
        onViewAll={() => navigate('/tim-san')}
      />
      <FeaturesSection />
    </main>
  );
}
