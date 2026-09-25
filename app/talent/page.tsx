import AppHeader from '@/components/app/AppHeader';
import TalentWorkspace from '@/components/talent/TalentWorkspace';

export default function TalentPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AppHeader />
      <TalentWorkspace />
    </div>
  );
}
