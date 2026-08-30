'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/components/landing/Primitives';

export function Pricing() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'FREE' | 'PRO' | null>(null);

  const plans = [
    {
      name: 'Basic',
      price: '₹0',
      period: 'lifetime',
      description: 'Try For Free',
      features: [
        'Up to 2 projects',
        'Basic analytics feed',
        'Real-time visitor logs',
        '7-day data retention',
        'Standard support'
      ],
      limitations: [
        'Access advanced geo tracking',
        'Access advanced CSV/JSON exports',
        'Custom domain support',
        'Team collaboration'
      ],
      buttonText: 'Get Access Now',
      popular: false,
      badge: '',
      plan: 'FREE' as const
    },
    {
      name: 'Pro Lifetime',
      price: '₹4,999',
      period: 'one-time',
      description: 'Lifetime Deal',
      features: [
        'Unlimited projects',
        'Advanced analytics dashboard',
        'Geo tracking & insights',
        '30-day data retention',
        'Priority support',
        'Custom domains',
        'CSV & JSON exports',
        'Team collaboration',
        'All future updates'
      ],
      limitations: [],
      buttonText: 'Get Lifetime Access Now',
      popular: true,
      badge: 'BUSY CREATORS\' CHOICE',
      plan: 'PRO' as const
    },
    {
      name: 'Pro Annual',
      price: '₹1,999',
      period: 'per year',
      description: '1 Year Access',
      features: [
        'Unlimited projects',
        'Advanced analytics dashboard',
        'Geo tracking & insights',
        '30-day data retention',
        'Priority support',
        'Custom domains',
        'CSV & JSON exports'
      ],
      limitations: [
        'Team collaboration features',
        'All future updates guarantee'
      ],
      buttonText: 'Get Annual Access',
      popular: false,
      badge: '',
      plan: 'PRO' as const
    }
  ];

  const handlePlanSelect = async (plan: 'FREE' | 'PRO') => {
    if (!session) {
      router.push('/auth');
      return;
    }

    setSelectedPlan(plan);
    setIsLoading(true);

    try {
      if (plan === 'FREE') {
        router.push('/dashboard');
      } else if (plan === 'PRO') {
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan: 'PRO'
          }),
        });

        if (response.ok) {
          const { url } = await response.json();
          window.location.href = url;
        } else {
          throw new Error('Failed to create checkout session');
        }
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <section id="pricing" className="relative py-20 sm:py-28 bg-[#fafaf9] dark:bg-black overflow-hidden px-4 sm:px-6 lg:px-8 border-t border-[#e8e6e5] dark:border-zinc-900">
      
      {/* ─── Circular Radial Glow Grid Background ──────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-100">
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[0.04] dark:border-white/[0.04]"
          style={{
            width: '1400px',
            height: '1400px',
            clipPath: 'circle(50% at 50% 50%)',
            background: 'radial-gradient(circle at center, rgba(59, 166, 241, 0.08) 0%, rgba(200, 200, 200, 0.03) 40%, transparent 80%)'
          }}
        >
          <div 
            className="absolute inset-0 opacity-5" 
            style={{
              backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)',
              backgroundSize: '60px 120px'
            }}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <span className="text-[11px] font-mono font-bold tracking-widest text-[#3ba6f1] uppercase">
            Transparent Pricing
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#0c0a09] dark:text-white tracking-tight leading-tight mt-2">
            Choose Your Plan
          </h2>
          <p className="max-w-md text-sm sm:text-base text-[#78716c] dark:text-zinc-400 mx-auto mt-4 leading-relaxed">
            Track visitor flows, live dashboards, and api access. Pay once for lifetime, or start with basic usage.
          </p>
        </div>

        {/* 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((p) => (
            <div 
              key={p.name}
              className={cn(
                "rounded-2xl bg-white dark:bg-zinc-950/50 backdrop-blur-md p-8 border transition-all duration-300 relative flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-none",
                p.popular ? "border-[#3ba6f1] ring-2 ring-[#3ba6f1]/20 dark:border-zinc-700 dark:ring-white/10" : "border-[#e8e6e5] dark:border-zinc-800/80"
              )}
            >
              {p.badge && (
                <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                  <span className="text-[10px] font-bold text-white tracking-widest px-4 py-1 rounded-full bg-[#3ba6f1] dark:bg-gradient-to-b dark:from-[#393939] dark:via-[#141414] dark:to-[#303030] shadow-md">
                    {p.badge}
                  </span>
                </div>
              )}

              <div className="flex flex-col h-full">
                {/* Upper card area */}
                <div className="mb-8">
                  <div className="inline-flex items-center font-semibold justify-center px-3 py-1 rounded-lg border border-[#e8e6e5] dark:border-zinc-800 bg-[#fafaf9] dark:bg-black/40">
                    <h3 className="text-xs text-[#0c0a09] dark:text-white uppercase tracking-wider">{p.name}</h3>
                  </div>
                  <p className="text-sm text-[#78716c] dark:text-zinc-400 mt-4 font-medium">{p.description}</p>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-bold text-[#0c0a09] dark:text-white">{p.price}</span>
                    <span className="text-[#a8a29e] dark:text-zinc-500 text-xs ml-2">/ {p.period}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8 flex-1">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-[#3ba6f1] dark:text-zinc-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-[#0c0a09] dark:text-zinc-300 leading-tight">{f}</span>
                    </div>
                  ))}

                  {p.limitations.map((l, i) => (
                    <div key={i} className="flex items-start gap-3 opacity-40">
                      <X className="h-4 w-4 text-[#a8a29e] dark:text-zinc-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-[#78716c] dark:text-zinc-500 leading-tight">{l}</span>
                    </div>
                  ))}
                </div>

                {/* Button container */}
                <div className="mt-auto">
                  <button
                    onClick={() => handlePlanSelect(p.plan)}
                    disabled={isLoading && selectedPlan === p.plan}
                    className={cn(
                      "w-full py-3 rounded-full text-sm font-semibold relative transition duration-200 flex items-center justify-center cursor-pointer",
                      p.popular
                        ? "text-white bg-[#3ba6f1] hover:bg-[#3398e1] shadow-[0_4px_16px_rgba(59,166,241,0.3)]"
                        : "text-[#0c0a09] dark:text-zinc-300 bg-transparent border border-[#e8e6e5] dark:border-zinc-800 hover:bg-[#fafaf9] dark:hover:border-zinc-700 dark:hover:text-white"
                    )}
                  >
                    {isLoading && selectedPlan === p.plan ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                    ) : (
                      p.buttonText
                    )}
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

    </section>
  );
}

export default Pricing;