import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AiTab } from './AiTab';
import { ManualTab } from './ManualTab';

/**
 * Main home page component containing AI and Manual tabs for flashcard creation.
 */
export function HomePage() {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');

  const handleAiImportSuccess = useCallback((count: number) => {
    const message = count === 1 
      ? 'Pomyślnie zaimportowano 1 fiszkę' 
      : `Pomyślnie zaimportowano ${count} fiszek`;
    toast.success(message);
  }, []);

  const handleManualCreateSuccess = useCallback((front: string) => {
    toast.success(`Fiszka "${front}" została dodana`);
  }, []);

  const handleError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Utwórz nowe fiszki
          </h1>
          <p className="text-muted-foreground">
            Generuj fiszki automatycznie za pomocą AI lub dodaj je ręcznie
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'ai' | 'manual')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="ai">
              Generuj z AI
            </TabsTrigger>
            <TabsTrigger value="manual">
              Dodaj ręcznie
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="mt-6">
            <AiTab
              onImportSuccess={handleAiImportSuccess}
              onError={handleError}
            />
          </TabsContent>

          <TabsContent value="manual" className="mt-6">
            <ManualTab
              onCreateSuccess={handleManualCreateSuccess}
              onError={handleError}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
