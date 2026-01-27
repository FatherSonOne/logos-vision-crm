/**
 * Project AI Enhancement Service
 * ================================
 * AI-powered enhancements for project planning including:
 * - Risk assessment per phase
 * - Resource estimation (budget, volunteers needed)
 * - Similar past projects comparison
 * - Success metrics suggestions per phase
 */

// Note: Using inline AI call since geminiService doesn't export a generic generate function
// This will be connected to the Gemini service or another AI provider

const getApiKey = () => import.meta.env?.VITE_GEMINI_API_KEY || '';

async function callGeminiAI(prompt: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'not-configured') {
    console.warn('API key not configured, using fallback responses');
    return '';
  }

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return response.text || '';
  } catch (error) {
    console.error('Gemini AI call failed:', error);
    return '';
  }
}

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RiskAssessment {
  phaseId: string;
  phaseName: string;
  overallRisk: 'low' | 'medium' | 'high';
  riskScore: number; // 0-100
  risks: Risk[];
  mitigationStrategies: string[];
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  category: 'timeline' | 'budget' | 'resource' | 'external' | 'technical' | 'stakeholder';
}

export interface ResourceEstimate {
  phaseId: string;
  phaseName: string;
  budgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  volunteersNeeded: {
    min: number;
    max: number;
    roles: string[];
  };
  staffHours: {
    min: number;
    max: number;
  };
  materials: MaterialEstimate[];
  timeline: {
    minDays: number;
    maxDays: number;
    recommendedDays: number;
  };
}

export interface MaterialEstimate {
  item: string;
  quantity: string;
  estimatedCost?: number;
  priority: 'essential' | 'recommended' | 'optional';
}

export interface SimilarProject {
  id: string;
  name: string;
  similarity: number; // 0-100
  outcome: 'success' | 'partial' | 'failed';
  lessonsLearned: string[];
  keyMetrics: Record<string, string | number>;
  date?: string;
}

export interface SuccessMetric {
  id: string;
  name: string;
  description: string;
  targetValue: string | number;
  unit?: string;
  measurementMethod: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'at_completion';
  category: 'output' | 'outcome' | 'impact' | 'process';
}

export interface PhaseSuccessMetrics {
  phaseId: string;
  phaseName: string;
  metrics: SuccessMetric[];
  overallSuccessCriteria: string;
}

export interface ProjectEnhancement {
  projectId: string;
  projectName: string;
  generatedAt: Date;
  riskAssessments: RiskAssessment[];
  resourceEstimates: ResourceEstimate[];
  similarProjects: SimilarProject[];
  successMetrics: PhaseSuccessMetrics[];
  recommendations: string[];
}

// ============================================================================
// AI PROMPTS
// ============================================================================

const RISK_ASSESSMENT_PROMPT = `
Analyze the following project phase and identify potential risks.
Return a JSON object with this structure:
{
  "overallRisk": "low" | "medium" | "high",
  "riskScore": number (0-100),
  "risks": [
    {
      "id": "risk_1",
      "title": "Risk title",
      "description": "Detailed description",
      "probability": "low" | "medium" | "high",
      "impact": "low" | "medium" | "high",
      "category": "timeline" | "budget" | "resource" | "external" | "technical" | "stakeholder"
    }
  ],
  "mitigationStrategies": ["Strategy 1", "Strategy 2"]
}

Project Type: {{projectType}}
Phase Name: {{phaseName}}
Tasks: {{tasks}}
Context: {{context}}
`;

const RESOURCE_ESTIMATION_PROMPT = `
Estimate the resources needed for this project phase.
Return a JSON object with this structure:
{
  "budgetRange": { "min": number, "max": number, "currency": "USD" },
  "volunteersNeeded": { "min": number, "max": number, "roles": ["Role 1", "Role 2"] },
  "staffHours": { "min": number, "max": number },
  "materials": [
    { "item": "Item name", "quantity": "10 units", "estimatedCost": 100, "priority": "essential" | "recommended" | "optional" }
  ],
  "timeline": { "minDays": number, "maxDays": number, "recommendedDays": number }
}

Project Type: {{projectType}}
Phase Name: {{phaseName}}
Tasks: {{tasks}}
Organization Size: {{orgSize}}
`;

const SUCCESS_METRICS_PROMPT = `
Suggest success metrics for this project phase.
Return a JSON object with this structure:
{
  "metrics": [
    {
      "id": "metric_1",
      "name": "Metric name",
      "description": "What this measures",
      "targetValue": "value or number",
      "unit": "optional unit",
      "measurementMethod": "How to measure",
      "frequency": "daily" | "weekly" | "monthly" | "at_completion",
      "category": "output" | "outcome" | "impact" | "process"
    }
  ],
  "overallSuccessCriteria": "Summary of what success looks like for this phase"
}

Project Type: {{projectType}}
Phase Name: {{phaseName}}
Tasks: {{tasks}}
Project Goal: {{goal}}
`;

const SIMILAR_PROJECTS_PROMPT = `
Based on the project description, suggest similar projects that could serve as references.
Return a JSON object with this structure:
{
  "similarProjects": [
    {
      "id": "proj_1",
      "name": "Project name",
      "similarity": number (0-100),
      "outcome": "success" | "partial" | "failed",
      "lessonsLearned": ["Lesson 1", "Lesson 2"],
      "keyMetrics": { "metric_name": "value" }
    }
  ],
  "recommendations": ["Recommendation based on similar projects"]
}

Project Type: {{projectType}}
Project Name: {{projectName}}
Description: {{description}}
Phases: {{phases}}
`;

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

class ProjectAiEnhancementService {
  /**
   * Generate complete AI enhancements for a project
   */
  async generateEnhancements(
    projectId: string,
    projectName: string,
    projectType: string,
    description: string,
    phases: Array<{ id: string; phaseName: string; tasks: string[] }>,
    options?: {
      organizationSize?: 'small' | 'medium' | 'large';
      includeRiskAssessment?: boolean;
      includeResourceEstimates?: boolean;
      includeSimilarProjects?: boolean;
      includeSuccessMetrics?: boolean;
    }
  ): Promise<ProjectEnhancement> {
    const opts = {
      organizationSize: 'medium',
      includeRiskAssessment: true,
      includeResourceEstimates: true,
      includeSimilarProjects: true,
      includeSuccessMetrics: true,
      ...options,
    };

    const enhancement: ProjectEnhancement = {
      projectId,
      projectName,
      generatedAt: new Date(),
      riskAssessments: [],
      resourceEstimates: [],
      similarProjects: [],
      successMetrics: [],
      recommendations: [],
    };

    // Generate enhancements in parallel where possible
    const promises: Promise<void>[] = [];

    if (opts.includeRiskAssessment) {
      promises.push(
        this.generateRiskAssessments(projectType, phases, description).then(
          assessments => { enhancement.riskAssessments = assessments; }
        )
      );
    }

    if (opts.includeResourceEstimates) {
      promises.push(
        this.generateResourceEstimates(projectType, phases, opts.organizationSize).then(
          estimates => { enhancement.resourceEstimates = estimates; }
        )
      );
    }

    if (opts.includeSimilarProjects) {
      promises.push(
        this.findSimilarProjects(projectType, projectName, description, phases).then(
          result => {
            enhancement.similarProjects = result.projects;
            enhancement.recommendations.push(...result.recommendations);
          }
        )
      );
    }

    if (opts.includeSuccessMetrics) {
      promises.push(
        this.generateSuccessMetrics(projectType, phases, description).then(
          metrics => { enhancement.successMetrics = metrics; }
        )
      );
    }

    await Promise.allSettled(promises);

    return enhancement;
  }

  /**
   * Generate risk assessments for each phase
   */
  async generateRiskAssessments(
    projectType: string,
    phases: Array<{ id: string; phaseName: string; tasks: string[] }>,
    context: string
  ): Promise<RiskAssessment[]> {
    const assessments: RiskAssessment[] = [];

    for (const phase of phases) {
      try {
        const prompt = RISK_ASSESSMENT_PROMPT
          .replace('{{projectType}}', projectType)
          .replace('{{phaseName}}', phase.phaseName)
          .replace('{{tasks}}', phase.tasks.join(', '))
          .replace('{{context}}', context);

        const response = await this.callAI(prompt);
        const parsed = this.parseJsonResponse(response);

        if (parsed && parsed.overallRisk && parsed.riskScore !== undefined) {
          assessments.push({
            phaseId: phase.id,
            phaseName: phase.phaseName,
            overallRisk: parsed.overallRisk as RiskAssessment['overallRisk'],
            riskScore: parsed.riskScore as number,
            risks: (parsed.risks || []) as Risk[],
            mitigationStrategies: (parsed.mitigationStrategies || []) as string[],
          });
        } else {
          assessments.push(this.getDefaultRiskAssessment(phase));
        }
      } catch (error) {
        console.error(`Risk assessment failed for phase ${phase.phaseName}:`, error);
        // Add fallback assessment
        assessments.push(this.getDefaultRiskAssessment(phase));
      }
    }

    return assessments;
  }

  /**
   * Generate resource estimates for each phase
   */
  async generateResourceEstimates(
    projectType: string,
    phases: Array<{ id: string; phaseName: string; tasks: string[] }>,
    orgSize: string
  ): Promise<ResourceEstimate[]> {
    const estimates: ResourceEstimate[] = [];

    for (const phase of phases) {
      try {
        const prompt = RESOURCE_ESTIMATION_PROMPT
          .replace('{{projectType}}', projectType)
          .replace('{{phaseName}}', phase.phaseName)
          .replace('{{tasks}}', phase.tasks.join(', '))
          .replace('{{orgSize}}', orgSize);

        const response = await this.callAI(prompt);
        const parsed = this.parseJsonResponse(response);

        if (parsed && parsed.budgetRange && parsed.volunteersNeeded) {
          estimates.push({
            phaseId: phase.id,
            phaseName: phase.phaseName,
            budgetRange: parsed.budgetRange as ResourceEstimate['budgetRange'],
            volunteersNeeded: parsed.volunteersNeeded as ResourceEstimate['volunteersNeeded'],
            staffHours: (parsed.staffHours || { min: 0, max: 0 }) as ResourceEstimate['staffHours'],
            materials: (parsed.materials || []) as MaterialEstimate[],
            timeline: (parsed.timeline || { minDays: 7, maxDays: 14, recommendedDays: 10 }) as ResourceEstimate['timeline'],
          });
        } else {
          estimates.push(this.getDefaultResourceEstimate(phase));
        }
      } catch (error) {
        console.error(`Resource estimation failed for phase ${phase.phaseName}:`, error);
        estimates.push(this.getDefaultResourceEstimate(phase));
      }
    }

    return estimates;
  }

  /**
   * Find similar projects for reference
   */
  async findSimilarProjects(
    projectType: string,
    projectName: string,
    description: string,
    phases: Array<{ id: string; phaseName: string; tasks: string[] }>
  ): Promise<{ projects: SimilarProject[]; recommendations: string[] }> {
    try {
      const prompt = SIMILAR_PROJECTS_PROMPT
        .replace('{{projectType}}', projectType)
        .replace('{{projectName}}', projectName)
        .replace('{{description}}', description)
        .replace('{{phases}}', phases.map(p => p.phaseName).join(', '));

      const response = await this.callAI(prompt);
      const parsed = this.parseJsonResponse(response);

      if (parsed && parsed.similarProjects) {
        return {
          projects: (parsed.similarProjects as SimilarProject[]) || [],
          recommendations: (parsed.recommendations as string[]) || [],
        };
      }
    } catch (error) {
      console.error('Similar projects search failed:', error);
    }

    return { projects: [] as SimilarProject[], recommendations: [] as string[] };
  }

  /**
   * Generate success metrics for each phase
   */
  async generateSuccessMetrics(
    projectType: string,
    phases: Array<{ id: string; phaseName: string; tasks: string[] }>,
    goal: string
  ): Promise<PhaseSuccessMetrics[]> {
    const metrics: PhaseSuccessMetrics[] = [];

    for (const phase of phases) {
      try {
        const prompt = SUCCESS_METRICS_PROMPT
          .replace('{{projectType}}', projectType)
          .replace('{{phaseName}}', phase.phaseName)
          .replace('{{tasks}}', phase.tasks.join(', '))
          .replace('{{goal}}', goal);

        const response = await this.callAI(prompt);
        const parsed = this.parseJsonResponse(response);

        if (parsed && parsed.metrics) {
          metrics.push({
            phaseId: phase.id,
            phaseName: phase.phaseName,
            metrics: (parsed.metrics as SuccessMetric[]) || [],
            overallSuccessCriteria: (parsed.overallSuccessCriteria as string) || '',
          });
        } else {
          metrics.push(this.getDefaultSuccessMetrics(phase));
        }
      } catch (error) {
        console.error(`Success metrics generation failed for phase ${phase.phaseName}:`, error);
        metrics.push(this.getDefaultSuccessMetrics(phase));
      }
    }

    return metrics;
  }

  // ---- Helper Methods ----

  private async callAI(prompt: string): Promise<string> {
    // Use Gemini service if available, otherwise return mock data
    try {
      const result = await callGeminiAI(prompt);
      return result || '';
    } catch (error) {
      console.warn('AI call failed, using fallback:', error);
      return '';
    }
  }

  private parseJsonResponse(response: string): Record<string, unknown> | null {
    if (!response) return null;

    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
    }

    return null;
  }

  private getDefaultRiskAssessment(phase: { id: string; phaseName: string }): RiskAssessment {
    return {
      phaseId: phase.id,
      phaseName: phase.phaseName,
      overallRisk: 'medium',
      riskScore: 50,
      risks: [
        {
          id: `risk_${phase.id}_1`,
          title: 'Timeline Risk',
          description: 'Tasks may take longer than expected',
          probability: 'medium',
          impact: 'medium',
          category: 'timeline',
        },
        {
          id: `risk_${phase.id}_2`,
          title: 'Resource Availability',
          description: 'Team members may have competing priorities',
          probability: 'medium',
          impact: 'low',
          category: 'resource',
        },
      ],
      mitigationStrategies: [
        'Build buffer time into the schedule',
        'Identify backup resources early',
        'Regular progress check-ins',
      ],
    };
  }

  private getDefaultResourceEstimate(phase: { id: string; phaseName: string }): ResourceEstimate {
    return {
      phaseId: phase.id,
      phaseName: phase.phaseName,
      budgetRange: { min: 500, max: 2000, currency: 'USD' },
      volunteersNeeded: { min: 2, max: 5, roles: ['General Volunteer', 'Coordinator'] },
      staffHours: { min: 20, max: 40 },
      materials: [],
      timeline: { minDays: 7, maxDays: 21, recommendedDays: 14 },
    };
  }

  private getDefaultSuccessMetrics(phase: { id: string; phaseName: string }): PhaseSuccessMetrics {
    return {
      phaseId: phase.id,
      phaseName: phase.phaseName,
      metrics: [
        {
          id: `metric_${phase.id}_1`,
          name: 'Task Completion Rate',
          description: 'Percentage of tasks completed on time',
          targetValue: '90%',
          measurementMethod: 'Track completed vs planned tasks',
          frequency: 'weekly',
          category: 'process',
        },
        {
          id: `metric_${phase.id}_2`,
          name: 'Stakeholder Satisfaction',
          description: 'Feedback from key stakeholders',
          targetValue: '4/5',
          unit: 'rating',
          measurementMethod: 'Survey or feedback form',
          frequency: 'at_completion',
          category: 'outcome',
        },
      ],
      overallSuccessCriteria: `Phase ${phase.phaseName} is successful when all key tasks are completed and stakeholders are satisfied with the outcomes.`,
    };
  }
}

// Export singleton instance
export const projectAiEnhancementService = new ProjectAiEnhancementService();

export default projectAiEnhancementService;
