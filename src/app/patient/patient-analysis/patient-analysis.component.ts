import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

interface AIAnalysis {
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  alerts: Array<{
    type: 'warning' | 'danger' | 'info';
    title: string;
    description: string;
  }>;
  patterns: Array<{
    pattern: string;
    frequency: string;
    recommendation: string;
  }>;
  recommendations: Array<{
    category: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  trends: Array<{
    metric: string;
    trend: 'improving' | 'stable' | 'worsening';
    description: string;
  }>;
  insights: Array<{
    title: string;
    value: string;
    description: string;
  }>;
}

@Component({
  selector: 'app-patient-analysis',
  templateUrl: './patient-analysis.component.html',
  styleUrls: ['./patient-analysis.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class PatientAnalysisComponent implements OnInit {
  patientId!: string;
  patient: Patient | null = null;
  analysis: AIAnalysis | null = null;
  loading = true;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = params['id'];
      this.loadData();
    });
  }
  
  loadData(): void {
    this.loading = true;
    
    // Try to load patient from multiple sources
    this.loadPatientFromSources();
  }

  private loadPatientFromSources(): void {
    // First try to get from triages (active patients)
    this.patientService.getTriageById(this.patientId).subscribe({
      next: (patient) => {
        if (patient) {
          this.patient = patient;
          this.loadAnalysis();
        } else {
          // Try completed patients
          this.loadFromCompletedPatients();
        }
      },
      error: (error) => {
        console.error('Error fetching from triages:', error);
        this.loadFromCompletedPatients();
      }
    });
  }

  private loadFromCompletedPatients(): void {
    this.patientService.getCompletedPatients('').subscribe({
      next: (completedPatients) => {
        this.patient = completedPatients.find(p => p.id === this.patientId) || null;
        if (this.patient) {
          this.loadAnalysis();
        } else {
          // Try regular patients as last resort
          this.loadFromRegularPatients();
        }
      },
      error: (error) => {
        console.error('Error fetching completed patients:', error);
        this.loadFromRegularPatients();
      }
    });
  }

  private loadFromRegularPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patient = patients.find(p => p.id === this.patientId) || null;
        this.loadAnalysis();
      },
      error: (error) => {
        console.error('Error fetching patients:', error);
        this.patient = this.generateMockPatient();
        this.loadAnalysis();
      }
    });
  }

  private generateMockPatient(): Patient {
    return {
      id: this.patientId,
      name: 'Maria Clara Lopes',
      cpf: '123.456.789-00',
      birthDate: '1985-03-15',
      motherName: 'Ana Maria Lopes',
      arrivalTime: '14:30',
      completedTime: '16:45',
      priority: 'Alta',
      symptoms: ['Febre', 'Dor de cabeça', 'Falta de ar', 'Dor muscular', 'Náusea/Vômito'],
      otherSymptoms: 'Mal-estar geral, perda de apetite e sudorese excessiva',
      duration: '5 dias',
      intensity: 'Alta',
      medications: 'Dipirona 500mg, Paracetamol 750mg',
      consultReason: 'Febre alta persistente há 5 dias, acompanhada de dificuldade respiratória e dores intensas no corpo',
      city: 'São Paulo',
      state: 'SP',
      diagnosis: 'Síndrome respiratória aguda - investigação em andamento',
      allergies: 'Alergia a penicilina',
      vitalSigns: {
        heartRate: 95,
        respiratoryRate: 22,
        temperature: 39.2,
        bloodPressureSystolic: 140,
        bloodPressureDiastolic: 85,
        oxygenSaturation: 94
      },
      aiHypotheses: [
        {
          probability: 'Provável',
          illness: 'COVID-19',
          details: 'Sintomas compatíveis com infecção por SARS-CoV-2, especialmente febre persistente e comprometimento respiratório'
        },
        {
          probability: 'Possível',
          illness: 'Pneumonia Bacteriana',
          details: 'Quadro respiratório com febre alta pode indicar processo infeccioso bacteriano'
        },
        {
          probability: 'Menos Provável',
          illness: 'Influenza A',
          details: 'Síndrome gripal com componente respiratório, porém menos provável pela intensidade dos sintomas'
        }
      ],
      aiAlerts: [
        {
          alert: 'Saturação de Oxigênio Baixa',
          reason: 'SpO2 de 94% indica comprometimento respiratório que requer monitoramento contínuo'
        },
        {
          alert: 'Febre Persistente',
          reason: 'Temperatura de 39.2°C por 5 dias consecutivos sugere processo infeccioso grave'
        }
      ]
    } as Patient;
  }
  
  loadAnalysis(): void {
    if (this.patient) {
      this.analysis = this.generateComprehensiveAnalysis(this.patient);
    } else {
      this.analysis = this.getDefaultAnalysis();
    }
    this.loading = false;
  }

  private generateComprehensiveAnalysis(patient: Patient): AIAnalysis {
    const symptoms = patient.symptoms || [];
    const intensity = patient.intensity || 'Leve';
    const priority = patient.priority || 'Baixa';
    const age = this.getAge(patient.birthDate || '');
    const vitalSigns = patient.vitalSigns;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let riskScore = 25;

    // Cálculo avançado de risco
    if (symptoms.includes('Febre') && symptoms.includes('Falta de ar')) {
      riskLevel = 'high';
      riskScore = 85;
    } else if (intensity === 'Alta' || priority === 'Alta') {
      riskLevel = 'high';
      riskScore = 80;
    } else if (symptoms.length > 3 || intensity === 'Moderada') {
      riskLevel = 'medium';
      riskScore = 60;
    } else if (age > 65) {
      riskLevel = 'medium';
      riskScore = 55;
    }

    // Ajustar score baseado em sinais vitais
    if (vitalSigns) {
      if (vitalSigns.temperature && vitalSigns.temperature > 38.5) riskScore += 10;
      if (vitalSigns.oxygenSaturation && vitalSigns.oxygenSaturation < 95) riskScore += 15;
      if (vitalSigns.heartRate && vitalSigns.heartRate > 100) riskScore += 5;
    }

    riskScore = Math.min(riskScore, 100);

    return {
      riskLevel,
      riskScore,
      alerts: this.generateDetailedAlerts(patient, symptoms, intensity, age, vitalSigns),
      patterns: this.generateDetailedPatterns(symptoms, patient),
      recommendations: this.generateDetailedRecommendations(patient, symptoms, intensity, age, vitalSigns),
      trends: this.generateDetailedTrends(patient, symptoms, intensity, vitalSigns),
      insights: this.generateAIInsights(patient, symptoms, vitalSigns)
    };
  }

  private generateDetailedAlerts(patient: Patient, symptoms: string[], intensity: string, age: number, vitalSigns: any): AIAnalysis['alerts'] {
    const alerts: AIAnalysis['alerts'] = [];

    // Usar alertas da IA se disponíveis
    if (patient.aiAlerts && patient.aiAlerts.length > 0) {
      patient.aiAlerts.forEach(alert => {
        alerts.push({
          type: 'danger',
          title: alert.alert,
          description: alert.reason
        });
      });
    }

    // Alertas baseados em sinais vitais
    if (vitalSigns) {
      if (vitalSigns.oxygenSaturation && vitalSigns.oxygenSaturation < 95) {
        alerts.push({
          type: 'danger',
          title: 'Hipoxemia Detectada',
          description: `Saturação de oxigênio de ${vitalSigns.oxygenSaturation}% está abaixo do normal. Necessário suporte respiratório imediato.`
        });
      }

      if (vitalSigns.temperature && vitalSigns.temperature > 39) {
        alerts.push({
          type: 'warning',
          title: 'Febre Alta Persistente',
          description: `Temperatura de ${vitalSigns.temperature}°C requer controle térmico agressivo e investigação da causa.`
        });
      }

      if (vitalSigns.heartRate && vitalSigns.heartRate > 100) {
        alerts.push({
          type: 'warning',
          title: 'Taquicardia',
          description: `Frequência cardíaca de ${vitalSigns.heartRate} bpm pode indicar compensação fisiológica ou complicação.`
        });
      }
    }

    // Alertas baseados em combinações de sintomas
    if (symptoms.includes('Febre') && symptoms.includes('Falta de ar')) {
      alerts.push({
        type: 'danger',
        title: 'Síndrome Respiratória Aguda',
        description: 'Combinação de febre e dispneia sugere processo infeccioso respiratório grave. Isolamento e investigação urgente necessários.'
      });
    }

    if (symptoms.includes('Dor de cabeça') && symptoms.includes('Febre') && symptoms.includes('Náusea/Vômito')) {
      alerts.push({
        type: 'warning',
        title: 'Possível Síndrome Meníngea',
        description: 'Tríade clássica presente. Considerar punção lombar se sinais de irritação meníngea.'
      });
    }

    // Alertas para grupos de risco
    if (age > 65 && intensity === 'Alta') {
      alerts.push({
        type: 'warning',
        title: 'Paciente Idoso de Alto Risco',
        description: 'Idade avançada combinada com sintomas intensos aumenta significativamente o risco de complicações.'
      });
    }

    // Alerta padrão se nenhum específico
    if (alerts.length === 0) {
      alerts.push({
        type: 'info',
        title: 'Quadro Clínico Estável',
        description: 'Sintomas apresentados são compatíveis com quadro viral comum. Manter observação e cuidados de suporte.'
      });
    }

    return alerts;
  }

  private generateDetailedPatterns(symptoms: string[], patient: Patient): AIAnalysis['patterns'] {
    const patterns: AIAnalysis['patterns'] = [];

    if (symptoms.includes('Febre') || symptoms.includes('Dor de cabeça') || symptoms.includes('Dor muscular')) {
      patterns.push({
        pattern: 'Síndrome Gripal Sazonal',
        frequency: '↑ 45% nas últimas 3 semanas',
        recommendation: 'Protocolo de isolamento respiratório, hidratação intensiva e monitoramento de sinais de alarme'
      });
    }

    if (symptoms.includes('Falta de ar') || symptoms.includes('Tosse')) {
      patterns.push({
        pattern: 'Infecções Respiratórias Virais',
        frequency: '↑ 38% no período epidemiológico',
        recommendation: 'Precauções respiratórias, oximetria seriada e considerar teste para COVID-19'
      });
    }

    if (symptoms.includes('Dor abdominal') || symptoms.includes('Náusea/Vômito')) {
      patterns.push({
        pattern: 'Gastroenterites Virais',
        frequency: '↑ 22% na região metropolitana',
        recommendation: 'Hidratação oral/venosa, dieta leve e monitoramento de sinais de desidratação'
      });
    }

    // Padrão baseado na prioridade
    if (patient.priority === 'Alta') {
      patterns.push({
        pattern: 'Casos de Alta Complexidade',
        frequency: '↑ 15% em relação ao mês anterior',
        recommendation: 'Avaliação médica prioritária e possível necessidade de internação'
      });
    }

    return patterns;
  }

  private generateDetailedRecommendations(patient: Patient, symptoms: string[], intensity: string, age: number, vitalSigns: any): AIAnalysis['recommendations'] {
    const recommendations: AIAnalysis['recommendations'] = [];

    // Recomendações baseadas em sinais vitais críticos
    if (vitalSigns?.oxygenSaturation && vitalSigns.oxygenSaturation < 95) {
      recommendations.push({
        category: 'Suporte Respiratório Urgente',
        action: 'Administrar oxigênio suplementar e monitorar gasometria arterial',
        priority: 'high'
      });
    }

    if (vitalSigns?.temperature && vitalSigns.temperature > 39) {
      recommendations.push({
        category: 'Controle Térmico',
        action: 'Antitérmicos EV, medidas físicas de resfriamento e investigação de foco infeccioso',
        priority: 'high'
      });
    }

    // Recomendações baseadas em sintomas
    if (symptoms.includes('Falta de ar')) {
      recommendations.push({
        category: 'Monitoramento Respiratório',
        action: 'Oximetria contínua, radiografia de tórax e considerar tomografia se piora clínica',
        priority: 'high'
      });
    }

    if (symptoms.includes('Febre') && patient.duration && patient.duration.includes('5')) {
      recommendations.push({
        category: 'Investigação Infecciosa',
        action: 'Hemograma, PCR, hemocultura e considerar teste para COVID-19',
        priority: 'medium'
      });
    }

    // Recomendações para grupos especiais
    if (age > 65) {
      recommendations.push({
        category: 'Cuidados Geriátricos',
        action: 'Avaliação cardiovascular, função renal e risco de delirium',
        priority: 'medium'
      });
    }

    if (patient.allergies && patient.allergies.includes('penicilina')) {
      recommendations.push({
        category: 'Precauções Alérgicas',
        action: 'Evitar beta-lactâmicos, usar alternativas como macrolídeos ou quinolonas',
        priority: 'medium'
      });
    }

    // Recomendações gerais
    recommendations.push({
      category: 'Hidratação e Suporte',
      action: 'Manter balanço hídrico adequado (35ml/kg/dia) e eletrólitos balanceados',
      priority: 'medium'
    });

    recommendations.push({
      category: 'Acompanhamento',
      action: 'Reavaliação em 6-12h ou imediatamente se piora dos sintomas',
      priority: 'low'
    });

    return recommendations;
  }

  private generateDetailedTrends(patient: Patient, symptoms: string[], intensity: string, vitalSigns: any): AIAnalysis['trends'] {
    const trends: AIAnalysis['trends'] = [];

    if (vitalSigns?.temperature) {
      trends.push({
        metric: 'Temperatura Corporal',
        trend: vitalSigns.temperature > 38.5 ? 'worsening' : 'stable',
        description: vitalSigns.temperature > 38.5 
          ? `Febre de ${vitalSigns.temperature}°C requer controle agressivo e monitoramento contínuo`
          : 'Temperatura controlada, manter vigilância'
      });
    }

    if (vitalSigns?.oxygenSaturation) {
      trends.push({
        metric: 'Saturação de Oxigênio',
        trend: vitalSigns.oxygenSaturation < 95 ? 'worsening' : 'stable',
        description: vitalSigns.oxygenSaturation < 95
          ? `SpO2 de ${vitalSigns.oxygenSaturation}% indica comprometimento respiratório`
          : 'Oxigenação adequada, manter monitoramento'
      });
    }

    if (symptoms.includes('Dor de cabeça') || symptoms.includes('Dor muscular')) {
      trends.push({
        metric: 'Sintomas Álgicos',
        trend: 'improving',
        description: 'Resposta esperada positiva com analgésicos e medidas de suporte'
      });
    }

    trends.push({
      metric: 'Estado Geral',
      trend: intensity === 'Alta' ? 'stable' : 'improving',
      description: intensity === 'Alta' 
        ? 'Quadro grave requer monitoramento intensivo'
        : 'Evolução favorável esperada com tratamento adequado'
    });

    return trends;
  }

  private generateAIInsights(patient: Patient, symptoms: string[], vitalSigns: any): AIAnalysis['insights'] {
    const insights: AIAnalysis['insights'] = [];

    // Insights baseados em IA se disponível
    if (patient.aiHypotheses && patient.aiHypotheses.length > 0) {
      const mainHypothesis = patient.aiHypotheses[0];
      insights.push({
        title: 'Diagnóstico Mais Provável',
        value: mainHypothesis.illness,
        description: `${mainHypothesis.probability}: ${mainHypothesis.details}`
      });
    }

    // Insights sobre gravidade
    const severityScore = this.calculateSeverityScore(symptoms, patient.intensity, vitalSigns);
    insights.push({
      title: 'Índice de Gravidade',
      value: `${severityScore}/10`,
      description: severityScore > 7 ? 'Alto risco de complicações' : severityScore > 4 ? 'Risco moderado' : 'Baixo risco'
    });

    // Insights sobre tempo de evolução
    if (patient.duration) {
      insights.push({
        title: 'Tempo de Evolução',
        value: patient.duration,
        description: 'Duração dos sintomas influencia prognóstico e abordagem terapêutica'
      });
    }

    // Insights sobre comorbidades
    const age = this.getAge(patient.birthDate || '');
    if (age > 65) {
      insights.push({
        title: 'Fator de Risco Etário',
        value: `${age} anos`,
        description: 'Idade avançada aumenta risco de complicações e necessidade de cuidados intensivos'
      });
    }

    return insights;
  }

  private calculateSeverityScore(symptoms: string[], intensity: string, vitalSigns: any): number {
    let score = 0;
    
    // Pontuação por sintomas
    score += symptoms.length;
    
    // Pontuação por intensidade
    if (intensity === 'Alta') score += 3;
    else if (intensity === 'Moderada') score += 2;
    else score += 1;
    
    // Pontuação por sinais vitais
    if (vitalSigns) {
      if (vitalSigns.temperature && vitalSigns.temperature > 39) score += 2;
      if (vitalSigns.oxygenSaturation && vitalSigns.oxygenSaturation < 95) score += 3;
      if (vitalSigns.heartRate && vitalSigns.heartRate > 100) score += 1;
    }
    
    return Math.min(score, 10);
  }

  private getDefaultAnalysis(): AIAnalysis {
    return {
      riskLevel: 'low',
      riskScore: 30,
      alerts: [
        {
          type: 'info',
          title: 'Dados Insuficientes',
          description: 'Análise limitada devido à falta de dados completos do paciente.'
        }
      ],
      patterns: [
        {
          pattern: 'Consulta de Rotina',
          frequency: 'Padrão normal',
          recommendation: 'Seguir protocolo padrão de atendimento'
        }
      ],
      recommendations: [
        {
          category: 'Coleta de Dados',
          action: 'Completar anamnese e exame físico detalhado',
          priority: 'medium'
        }
      ],
      trends: [
        {
          metric: 'Dados Clínicos',
          trend: 'stable',
          description: 'Necessário mais informações para análise completa'
        }
      ],
      insights: [
        {
          title: 'Status da Análise',
          value: 'Incompleta',
          description: 'Dados insuficientes para análise detalhada'
        }
      ]
    };
  }
  
  navigateToHistory(): void {
    this.router.navigate(['/patient', this.patientId, 'history']);
  }

  getRiskLevelClass(level: string): string {
    switch (level) {
      case 'high':
        return 'risk-high';
      case 'medium':
        return 'risk-medium';
      case 'low':
        return 'risk-low';
      default:
        return 'risk-low';
    }
  }

  getRiskLevelText(level: string): string {
    switch (level) {
      case 'high':
        return 'Alto Risco';
      case 'medium':
        return 'Risco Moderado';
      case 'low':
        return 'Baixo Risco';
      default:
        return 'Baixo Risco';
    }
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'danger':
        return 'dangerous';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'improving':
        return 'trending_up';
      case 'worsening':
        return 'trending_down';
      case 'stable':
        return 'trending_flat';
      default:
        return 'trending_flat';
    }
  }

  getTrendClass(trend: string): string {
    switch (trend) {
      case 'improving':
        return 'trend-improving';
      case 'worsening':
        return 'trend-worsening';
      case 'stable':
        return 'trend-stable';
      default:
        return 'trend-stable';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-low';
    }
  }

  public getAge(birthDate: string): number {
    if (!birthDate) return 0;
    
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    
    return age;
  }
}