import { motion } from 'framer-motion';
import { Coffee, Car, Users, Calendar } from 'lucide-react';

interface ServiceOptionsProps {
  onSelectService: (service: string) => void;
}

export const ServiceOptions: React.FC<ServiceOptionsProps> = ({ onSelectService }) => {
  const services = [
    {
      id: 'coffee',
      name: 'Leap Café',
      icon: Coffee,
      description: 'Relaxe com um café enquanto conhece nossos veículos',
      color: 'from-amber-400 to-amber-600'
    },
    {
      id: 'test-drive',
      name: 'Test-drive',
      icon: Car,
      description: 'Experimente a sensação de dirigir um Leapmotor',
      color: 'from-leap-green-400 to-leap-green-600'
    },
    {
      id: 'consultant',
      name: 'Falar com Consultor',
      icon: Users,
      description: 'Converse com um especialista em veículos elétricos',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'schedule',
      name: 'Agendar Visita',
      icon: Calendar,
      description: 'Marque um horário exclusivo para atendimento',
      color: 'from-purple-400 to-purple-600'
    }
  ];

  const coffeeOptions = [
    { id: 'espresso', name: 'Café expresso', image: '☕' },
    { id: 'double-espresso', name: 'Expresso duplo', image: '☕' },
    { id: 'latte', name: 'Café com leite', image: '☕' },
    { id: 'cappuccino', name: 'Cappuccino', image: '☕' }
  ];

  return (
    <div className="w-full">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Solicite um serviço</h3>
      
      {/* Main Services */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {services.map((service, index) => (
          <motion.button
            key={service.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectService(service.id)}
            className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${service.color}`} />
            <div className="relative z-10">
              <service.icon className="w-10 h-10 mb-3 mx-auto" />
              <h4 className="font-semibold text-lg mb-2">{service.name}</h4>
              <p className="text-sm opacity-90">{service.description}</p>
            </div>
            <motion.div
              className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"
            />
          </motion.button>
        ))}
      </div>

      {/* Coffee Options */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Coffee className="w-5 h-5 text-amber-600" />
          Opções de Café
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {coffeeOptions.map((coffee) => (
            <motion.button
              key={coffee.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectService(`coffee-${coffee.id}`)}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-2">{coffee.image}</div>
              <p className="text-sm text-gray-700">{coffee.name}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectService('eco-info')}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-medium shadow-lg"
        >
          🌱 Benefícios Ecológicos
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectService('financing')}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-medium shadow-lg"
        >
          💰 Opções de Financiamento
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectService('warranty')}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full font-medium shadow-lg"
        >
          🛡️ Garantia e Suporte
        </motion.button>
      </div>
    </div>
  );
};