import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Users, 
  BookOpen, 
  Award, 
  Heart, 
  Globe,
  Target,
  Shield
} from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: 'Flexible Schedule',
    description: 'Morning and evening classes to accommodate different schedules'
  },
  {
    icon: Users,
    title: 'Small Class Sizes',
    description: 'Personalized attention with small student-to-teacher ratios'
  },
  {
    icon: BookOpen,
    title: 'Qualified Teachers',
    description: 'Experienced Huffadh and Islamic scholars as instructors'
  },
  {
    icon: Award,
    title: 'Regular Assessments',
    description: 'Continuous evaluation and progress tracking'
  },
  {
    icon: Heart,
    title: 'Supportive Environment',
    description: 'Nurturing atmosphere focused on student success'
  },
  {
    icon: Globe,
    title: 'Global Community',
    description: 'Connect with students from around the world'
  },
  {
    icon: Target,
    title: 'Goal Oriented',
    description: 'Clear milestones and achievement recognition'
  },
  {
    icon: Shield,
    title: 'Safe Learning',
    description: 'Secure and monitored online learning environment'
  }
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900"
          >
            Why Choose{' '}
            <span className="text-primary-600">An-Namuslimah</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto"
          >
            We provide a comprehensive Islamic education experience that combines
            traditional values with modern teaching methods.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors">
                <feature.icon className="h-6 w-6 text-primary-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};