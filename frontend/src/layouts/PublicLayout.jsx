import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AiAssistantModal from '../components/AiAssistantModal';

export default function PublicLayout() {
  const [aiModalOpen, setAiModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-white">
      <Navbar onOpenAiAssistant={() => setAiModalOpen(true)} />
      <main className="flex-grow">
        <Outlet context={{ openAiAssistant: () => setAiModalOpen(true) }} />
      </main>
      <Footer />

      {/* Global AI Assistant Modal */}
      <AiAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />
    </div>
  );
}
