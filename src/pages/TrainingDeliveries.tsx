import { mockProject } from '@/data/mockData';
import { TrainingCard } from '@/components/onboarding/TrainingCard';
import { DeliveryCard } from '@/components/onboarding/DeliveryCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Package } from 'lucide-react';

export default function TrainingDeliveries() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Treinamentos e Entregas</h1>
        <p className="text-sm text-muted-foreground mt-1">Sessões de treinamento e entregas do projeto</p>
      </div>

      <Tabs defaultValue="trainings">
        <TabsList className="bg-muted">
          <TabsTrigger value="trainings" className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" /> Treinamentos
          </TabsTrigger>
          <TabsTrigger value="deliveries" className="flex items-center gap-1.5">
            <Package className="w-4 h-4" /> Entregas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trainings" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockProject.trainings.map(t => (
              <TrainingCard key={t.id} training={t} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deliveries" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockProject.deliveries.map(d => (
              <DeliveryCard key={d.id} delivery={d} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
