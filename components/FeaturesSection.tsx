"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { CheckCircle, Clock, BarChart3, MessageSquare } from "lucide-react"

const features = [
  {
    icon: CheckCircle,
    title: "Quick Resolution",
    description: "Automated routing and prioritization for faster complaint resolution",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Round-the-clock complaint submission and tracking system",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive insights and reporting on complaint patterns",
  },
  {
    icon: MessageSquare,
    title: "Multi-channel Support",
    description: "Support for web, mobile, and social media complaints",
  },
]

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-card border border-border rounded-2xl p-6 group hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
            <feature.icon className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {feature.title}
          </h3>
          <p className="text-muted-foreground text-sm">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export function FeaturesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Why Choose Power-CMS?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the next generation of complaint management with cutting-edge features
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}