import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, Award, Truck, RotateCcw, HelpCircle, CheckCircle } from 'lucide-react';

export const revalidate = 86400; // Cache on Vercel CDN for 24 hours

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16">
      {/* Hero Intro */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="px-4 py-1.5 rounded-full bg-white/10 text-xs font-mono tracking-widest text-emerald-400 uppercase">
          The NenoFlex Manifesto
        </span>
        <h1 className="luxury-title text-4xl sm:text-6xl font-bold text-white">
          Flex Your Style. Redefining Thrift.
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
          NenoFlex was born out of a passion for high-grade streetwear and sustainable luxury fashion. We bridge the gap between high-end international showroom fashion and accessibility.
        </p>
      </div>

      {/* 7-Step Sanitization Process */}
      <div className="p-8 rounded-3xl bg-[#171717] border border-white/10 space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h2 className="luxury-heading text-2xl font-bold text-white">Our 7-Step Sanitization Protocol</h2>
        </div>
        <p className="text-xs text-neutral-400">
          Every handpicked garment imported from Tokyo, Seoul, London, and New York undergoes a rigid hospital-grade restoration process before entering our vault.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {[
            { step: '01', title: 'Curator Vault Inspection', desc: 'Detailed physical audit for tag authenticity, stitching, and zipper hardware.' },
            { step: '02', title: 'Ozone Gas Deodorization', desc: 'Eliminates 99.9% of bacteria and vintage storage scent inside sealed ozone chambers.' },
            { step: '03', title: 'Medical-Grade UV-C Sterilization', desc: 'High-intensity UV treatment destroying all surface microbes.' },
            { step: '04', title: 'High-Temperature Steam Pressing', desc: 'Deep fabric fiber rejuvenation and crease removal.' },
            { step: '05', title: 'Precision Lint & Pill Removal', desc: 'Restores fabric surface texture to 9.8+ mint showroom condition.' },
            { step: '06', title: 'Authenticity Seal Verification', desc: 'Final sign-off by master vintage fashion appraiser.' },
            { step: '07', title: 'Sealed Anti-Bacterial Eco-Packaging', desc: 'Packed in vacuum-sealed dust covers ready for express dispatch.' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1">
              <span className="font-mono text-emerald-400 font-bold text-xs">STEP {item.step}</span>
              <h4 className="font-bold text-white">{item.title}</h4>
              <p className="text-neutral-400 text-[11px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordions */}
      <div id="faq" className="space-y-6">
        <h2 className="luxury-heading text-2xl font-bold text-white">Frequently Asked Questions</h2>
        <div className="space-y-4 text-xs">
          {[
            { q: 'Are all NenoFlex items 100% authentic original brands?', a: 'Yes. We guarantee 100% authenticity on every piece from Nike, TNF, Essentials, Carhartt, and Levi’s. If any item fails our verification checks, we offer a 100% instant refund.' },
            { q: 'What is the condition of thrift items?', a: 'We only accept items rated 9.0/10 and above. Most pieces are 9.6-9.8 Mint Condition (Like New with zero flaws or visible wear).' },
            { q: 'How long does shipping take?', a: 'All orders are dispatched via BlueDart Express Air within 24 hours. Delivery takes 2-4 business days across India.' },
            { q: 'What is your return policy?', a: 'We offer hassle-free 7-day returns if the item size or condition does not meet your expectations.' },
          ].map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#171717] border border-white/10 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-400" /> {faq.q}
              </h4>
              <p className="text-neutral-300 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
