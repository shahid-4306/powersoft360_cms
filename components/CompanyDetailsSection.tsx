


"use client"

import { motion } from "framer-motion"
import { Building2, MapPin, Phone, Mail, Globe } from "lucide-react"
import { FileText, CheckCircle2, Clock } from "lucide-react"

interface CompanyDetail {
  id: string
  name: string
  value: string
  type: 'text' | 'email' | 'phone' | 'url'
  icon: any
}

export function CompanyDetailsSection() {
  const companyDetails: CompanyDetail[] = [
    {
      id: '1',
      name: 'Company Name',
      value: 'Powersoft360',
      type: 'text',
      icon: Building2
    },
    {
      id: '2',
      name: 'Address',
      value: 'Markaz Ibn-e-Abbas Road, Near Jinnah Park,G.T Road, Gujranwala, Pakistan',
      type: 'text',
      icon: MapPin
    },
    {
      id: '3',
      name: 'Phone',
      value: '+92 (55) 4 55 6056',
      type: 'phone',
      icon: Phone
    },
    {
      id: '4',
      name: 'Email',
      value: 'info@powersoft360.pk',
      type: 'email',
      icon: Mail
    },
    {
      id: '5',
      name: 'Website',
      value: 'support@powersoft360.pk',
      type: 'url',
      icon: Globe
    }
  ]

  return (
    <section id="company" className="py-4 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Company Details
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our company information and contact details
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h3 className="text-2xl font-bold text-foreground mb-6">Company Information</h3>

            <div className="space-y-4">
              {companyDetails.map((detail) => (
                <motion.div
                  key={detail.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center p-4 bg-secondary/20 rounded-lg border border-border"
                >
                  <detail.icon className="w-5 h-5 text-primary mr-4 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-foreground mb-1">
                      {detail.name}
                    </div>
                    <div className="text-muted-foreground">
                      {detail.value}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Company Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { 
                label: 'Total Complaints', 
                value: '300+', 
                color: 'from-primary to-primary/80',
                icon: FileText,
                description: 'Registered in system',
                trend: '+12% this month'
              },
              { 
                label: 'Resolved', 
                value: '1,089', 
                color: 'from-chart-3 to-chart-3/80',
                icon: CheckCircle2,
                description: 'Successfully closed',
                trend: '98.5% success rate'
              },
              { 
                label: 'In Progress', 
                value: '145', 
                color: 'from-accent to-accent/80',
                icon: Clock,
                description: 'Currently being handled',
                trend: 'Avg. 24h resolution'
              },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ 
                  y: -5,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="bg-card border border-border rounded-2xl p-6 text-center group hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  <stat.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                
                <div className="text-3xl font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  {stat.label}
                </h4>
                
                <p className="text-muted-foreground text-sm mb-2">
                  {stat.description}
                </p>
                
                <div className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full inline-block">
                  {stat.trend}
                </div>

                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300 -z-10`}></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}