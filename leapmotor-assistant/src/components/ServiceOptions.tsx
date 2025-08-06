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
      <h3 className="text-xl font-bold text-white mb-4">Solicite um serviço</h3>
      
      {/* Main Services - Grid 2x2 compacto */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {services.map((service, index) => (
          <button
            key={service.id}
            onClick={() => onSelectService(service.id)}
            className="relative overflow-hidden rounded-xl p-3 text-white shadow-lg group bg-gray-800 border border-gray-700 h-20 hover:scale-105 transition-transform"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-70`} />
            <div className="relative z-10 flex items-center gap-2">
              <service.icon className="w-5 h-5 flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-medium text-sm">{service.name}</h4>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Coffee Options - Compacto */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-4">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Coffee className="w-4 h-4 text-leap-green-500" />
          Opções de Café
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {coffeeOptions.map((coffee) => (
            <button
              key={coffee.id}
              onClick={() => onSelectService(`coffee-${coffee.id}`)}
              className="bg-gray-700 rounded-lg p-2 shadow hover:shadow-lg transition-shadow border border-gray-600 hover:border-leap-green-500/30 text-center hover:scale-105 transition-all"
            >
              <div className="text-lg mb-1">{coffee.image}</div>
              <p className="text-xs text-gray-300">{coffee.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions - Pills menores */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectService('eco-info')}
          className="px-3 py-1 bg-leap-green-500 hover:bg-leap-green-600 text-white rounded-full text-xs font-medium shadow hover:scale-105 transition-all"
        >
          🌱 Ecológicos
        </button>
        <button
          onClick={() => onSelectService('financing')}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-full text-xs font-medium shadow border border-gray-600 hover:scale-105 transition-all"
        >
          💰 Financiamento
        </button>
        <button
          onClick={() => onSelectService('warranty')}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-full text-xs font-medium shadow border border-gray-600 hover:scale-105 transition-all"
        >
          🛡️ Garantia
        </button>
      </div>
    </div>
  );
};