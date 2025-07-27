import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const vaccineInfo = [
  {
    id: "bcg",
    name: "BCG (Tuberculosis)",
    schedule: "At birth",
    description:
      "Protects against tuberculosis, especially severe forms in children.",
    sideEffects: [
      "Small sore at injection site",
      "Swollen lymph nodes",
      "Small scar formation",
    ],
    myths: [
      "BCG vaccine causes tuberculosis",
      "BCG is not necessary in low TB areas",
    ],
    facts: [
      "BCG prevents severe TB in children",
      "Safe and effective when given properly",
    ],
  },
  {
    id: "hepatitisB",
    name: "Hepatitis B",
    schedule: "At birth, 6 weeks, 10 weeks, 14 weeks",
    description:
      "Protects against hepatitis B virus infection affecting the liver.",
    sideEffects: ["Mild fever", "Soreness at injection site", "Fatigue"],
    myths: [
      "Hepatitis B vaccine causes autism",
      "Only high-risk people need this vaccine",
    ],
    facts: [
      "No link between vaccines and autism",
      "All children should receive hepatitis B vaccine",
    ],
  },
  {
    id: "dpt",
    name: "DPT (Diphtheria, Pertussis, Tetanus)",
    schedule: "6 weeks, 10 weeks, 14 weeks",
    description:
      "Protects against three serious diseases: diphtheria, pertussis (whooping cough), and tetanus.",
    sideEffects: ["Mild fever", "Swelling at injection site", "Fussiness"],
    myths: ["DPT vaccine causes brain damage", "Natural immunity is better"],
    facts: [
      "Modern DPT vaccines are very safe",
      "Vaccine-preventable diseases are much more dangerous",
    ],
  },
  {
    id: "polio",
    name: "Polio (OPV/IPV)",
    schedule: "6 weeks, 10 weeks, 14 weeks",
    description: "Protects against poliomyelitis, which can cause paralysis.",
    sideEffects: ["Very rare side effects", "Mild allergic reactions (rare)"],
    myths: [
      "Polio vaccine causes polio",
      "Polio is eradicated, vaccine not needed",
    ],
    facts: [
      "Vaccine-associated polio is extremely rare",
      "Vaccination maintains eradication",
    ],
  },
  {
    id: "mmr",
    name: "MMR (Measles, Mumps, Rubella)",
    schedule: "9 months, 16-24 months",
    description: "Protects against measles, mumps, and rubella.",
    sideEffects: ["Mild fever", "Rash", "Swelling of glands"],
    myths: ["MMR vaccine causes autism", "Natural infection is better"],
    facts: [
      "Extensively studied - no autism link",
      "Complications from diseases are serious",
    ],
  },
];

const educationArticles = [
  {
    title: "Understanding Vaccination Schedules",
    excerpt: "Learn why vaccines are given at specific ages and intervals.",
    content:
      "Vaccination schedules are carefully designed based on when children are most vulnerable to diseases and when their immune systems can best respond to vaccines...",
  },
  {
    title: "Common Vaccine Side Effects",
    excerpt:
      "What to expect after vaccination and when to seek medical attention.",
    content:
      "Most vaccine side effects are mild and temporary. Common reactions include mild fever, soreness at injection site...",
  },
  {
    title: "Importance of Herd Immunity",
    excerpt:
      "How community vaccination protects everyone, especially vulnerable populations.",
    content:
      "Herd immunity occurs when a large portion of a community becomes immune to a disease...",
  },
  {
    title: "Vaccine Safety and Testing",
    excerpt: "The rigorous process vaccines go through before approval.",
    content:
      "Vaccines undergo extensive testing in multiple phases before approval...",
  },
];

const faqData = [
  {
    question: "Are vaccines safe for my child?",
    answer:
      "Yes, vaccines are very safe. They undergo rigorous testing before approval and are continuously monitored for safety. Serious side effects are extremely rare, and the benefits far outweigh the risks.",
  },
  {
    question: "Can vaccines overload my child's immune system?",
    answer:
      "No, children's immune systems can handle vaccines easily. Babies encounter many more antigens in their daily environment than in all vaccines combined.",
  },
  {
    question: "What if my child misses a vaccination?",
    answer:
      "If your child misses a vaccination, contact your healthcare provider. They can adjust the schedule and catch up on missed vaccines safely.",
  },
  {
    question: "Do vaccines cause autism?",
    answer:
      "No, extensive research has found no link between vaccines and autism. This myth has been thoroughly debunked by numerous large-scale studies.",
  },
  {
    question: "Why does my child need so many vaccines?",
    answer:
      "Each vaccine protects against specific diseases. The schedule is designed to provide protection when children are most vulnerable to these diseases.",
  },
  {
    question: "Where can I find the nearest vaccination centers?",
    answer: (
      <a
        href="https://www.google.com/maps/search/vaccine+centers+near+me"
        target="_blank"
      >
        Find nearby vaccine centers
      </a>
    ),
  },
];

const Education = () => {
  const [selectedVaccine, setSelectedVaccine] = useState<string | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Vaccination Education
          </h1>
          <p className="text-muted-foreground mt-1">
            Learn about vaccines, schedules, and make informed decisions
          </p>
        </div>

        <Tabs defaultValue="vaccines" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vaccines">Vaccines</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="myths">Myths & Facts</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="vaccines" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vaccineInfo.map((vaccine) => (
                <Card
                  key={vaccine.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{vaccine.name}</CardTitle>
                    <Badge variant="secondary">{vaccine.schedule}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {vaccine.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedVaccine(vaccine.id)}
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedVaccine && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {vaccineInfo.find((v) => v.id === selectedVaccine)?.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedVaccine(null)}
                    className="w-fit"
                  >
                    Close
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const vaccine = vaccineInfo.find(
                      (v) => v.id === selectedVaccine
                    );
                    if (!vaccine) return null;

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">
                            Common Side Effects
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {vaccine.sideEffects.map((effect, index) => (
                              <li key={index}>• {effect}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">
                            Facts vs Myths
                          </h4>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-destructive">
                                Common Myths:
                              </p>
                              <ul className="text-sm text-muted-foreground">
                                {vaccine.myths.map((myth, index) => (
                                  <li key={index}>• {myth}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-success">
                                Facts:
                              </p>
                              <ul className="text-sm text-muted-foreground">
                                {vaccine.facts.map((fact, index) => (
                                  <li key={index}>• {fact}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="articles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {educationArticles.map((article, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {article.excerpt}
                    </p>
                    <p className="text-sm text-foreground">{article.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="myths" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vaccineInfo.map((vaccine) => (
                <Card key={vaccine.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{vaccine.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-destructive mb-2">
                          Common Myths
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {vaccine.myths.map((myth, index) => (
                            <li key={index}>❌ {myth}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-success mb-2">
                          Scientific Facts
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {vaccine.facts.map((fact, index) => (
                            <li key={index}>✅ {fact}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqData.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Education;
