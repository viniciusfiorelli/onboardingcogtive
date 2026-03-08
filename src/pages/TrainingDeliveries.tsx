import { mockProject } from '@/data/mockData';
import { TrainingCard } from '@/components/onboarding/TrainingCard';
import { DeliveryCard } from '@/components/onboarding/DeliveryCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Package, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrainingDeliveries() {
  const trainings = mockProject.trainings;
  const deliveries = mockProject.deliveries;
  const doneTrainings = trainings.filter(t => t.status === 'realizado').length;
  const doneDeliveries = deliveries.filter(d => d.status === 'concluida').length;

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Treinamentos e Entregas</h1>
        <p className="text-sm text-muted-foreground mt-1">Sessões de capacitação e entregas do projeto</p>
      </motion.div>

      {/* Summary strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="flex flex-wrap gap-3"
      >
        <div className="flex items-center gap-2 bg-primary/8 border border-primary/15 rounded-full px-4 py-2 text-sm">
          <GraduationCap className="w-4 h-4 text-primary" />
          <span className="text-foreground font-semibold">{trainings.length}</span>
          <span className="text-muted-foreground">treinamentos</span>
          {doneTrainings > 0 && <span className="text-success text-xs">({doneTrainings} concluídos)</span>}
        </div>
        <div className="flex items-center gap-2 bg-success/8 border border-success/15 rounded-full px-4 py-2 text-sm">
          <Package className="w-4 h-4 text-success" />
          <span className="text-foreground font-semibold">{doneDeliveries}/{deliveries.length}</span>
          <span className="text-muted-foreground">entregas concluídas</span>
        </div>
      </motion.div>

      <Tabs defaultValue="trainings">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="trainings" className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" /> Treinamentos
          </TabsTrigger>
          <TabsTrigger value="deliveries" className="flex items-center gap-1.5">
            <Package className="w-4 h-4" /> Entregas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trainings" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainings.map((t, i) => (
              <TrainingCard key={t.id} training={t} index={i} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deliveries" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliveries.map((d, i) => (
              <DeliveryCard key={d.id} delivery={d} index={i} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
