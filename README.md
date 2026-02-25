# enagramJS

JS-VAULT
Learning Platform


Evidence-Based Technical Specification
Architectural Blueprint for a Persistent, React-Based Microlearning Application
This document outlines the technical architecture for a web-based JavaScript learning platform, grounded in peer-reviewed research across cognitive science, educational psychology, and behavioral economics.
February 2026 — v2.0 (Evidence-Enhanced)

1. System Architecture Overview
The application follows a modular, client-side-heavy architecture to ensure offline functionality and zero-latency feedback loops. The design decisions are grounded in Cognitive Load Theory (CLT), Self-Determination Theory (SDT), and spaced repetition research.
1.1 Core Tech Stack
Component
Technology
UI Framework
React 19+ (TypeScript-first)
State Management
Zustand with persist middleware
Persistence Layer
Web Storage API (LocalStorage)
Execution Sandbox
Web Worker-based JS Evaluation Engine
Styling
Tailwind CSS (Atomic CSS for UI performance)


1.2 Data Flow & Persistence
The system treats LocalStorage as the primary Source of Truth. This reduces server dependency and enables instant-on user sessions, minimizing extraneous cognitive load during session resumption — a principle supported by CLT research showing that reducing non-essential processing demands frees working memory for actual learning [1, 5].
2. State Schema Design (The "Vault")
The application state is structured to track not only progress but also the decay of knowledge over time, directly implementing the Ebbinghaus forgetting model [8, 9].
TypeScript Interface:
interface JSVaultSchema { user: { xp: number; streak: { current: number; lastCheckIn: string; freezeAvailable: number; } }; progress: { unlockedModules: string[]; completedNodes: Record<string, { score: number; attempts: number; lastReviewed: string; }>; }; cognitiveMap: { [topicId: string]: MasteryLevel; }; }

The cognitiveMap field implements mastery tracking based on the spacing effect, where each topic's retention probability decays over time unless reinforced. A comprehensive meta-analysis by Cepeda et al. (2006) confirmed that distributing practice across time intervals reliably improves recall across a wide range of materials and time scales [10].

3. Microlearning Engine & UX Design
To prevent cognitive overload, the curriculum is decomposed into Atomic Nodes. This approach is directly supported by extensive empirical research.
📚 Research Foundation: Cognitive Load Theory & Microlearning
A 2024 study in the European Journal of Education and Pedagogy (Lopez, 2024, n=300) found that microlearning modules showed higher germane cognitive load and were "highly effective, improving knowledge retention, engagement, and learning outcomes" [1]. A post-test control group study at Christ University (Balasundaram et al., 2024) confirmed that microlearning groups scored significantly higher than control groups (M=6.6 vs M=5.6, p<0.05) [2]. A meta-analysis of 42 studies (n=15,673) found a pooled odds ratio of 1.87 (95% CI: 1.45–2.41, p<0.001) for positive effects on student retention [3]. A 2024 study in Scientific Reports showed that adaptive microlearning significantly reduced extraneous cognitive load (mean difference -20.02, p<0.05) [5].


3.1 Node-Based Curriculum (DAG)
Learning is mapped as a Directed Acyclic Graph (DAG). Users cannot access "Advanced Closures" without passing "Scope Fundamentals," ensuring structured build-up of mental models. This prerequisite structure aligns with CLT's emphasis on building schemas incrementally — Sweller's original research (1988) demonstrated that cognitive load during problem-solving impairs learning when learners lack the foundational schemas to process new information efficiently [4].
3.2 Interaction Principles
The 5-Minute Sprint — Every module is designed to be completed in under 5 minutes. While the original specification proposed 3 minutes, the broader research literature identifies 5–15 minutes as the optimal duration for microlearning interventions. A comprehensive literature review synthesizing empirical studies and meta-analyses found that interventions of 5–15 minutes can significantly improve retention rates compared to traditional extended sessions [6]. We target the lower bound of this range to maintain high engagement.

📚 Design Revision: Module Duration Adjusted (3 min → 5 min)
The shift from a 180-second target to approximately 5 minutes is based on a broader evidence base. While brevity is critical for managing cognitive load, modules that are too short risk fragmenting concepts beyond the point of coherence — a concern noted in reviews highlighting that microlearning's conciseness may limit deeper learning unless supported by thoughtful scaffolding (Mostrady et al., 2024) [7]. A 5-minute floor allows room for context-setting, active coding, and meaningful feedback.


Immediate Validation — A dedicated Web Worker executes user code against a set of assert tests. Success triggers a dopamine-mediated reinforcement signal (XP gain), while failure provides specific corrective hints to minimize frustration.

📚 Research Foundation: Feedback & Learning Outcomes
A landmark meta-analysis (Wisniewski et al., 2020; 435 studies, k=994, N>61,000) found a medium effect size (d=0.48) of feedback on student learning, with corrective feedback being especially effective for learning new skills and tasks [11]. Computer-assisted feedback showed medium-high to high effect sizes. A meta-analysis by Kulik & Kulik found that applied studies using real learning materials "usually found immediate feedback to be more effective than delayed" [12]. According to Feedback Intervention Theory, immediate feedback aligns with task-focused attention, swiftly correcting errors and reinforcing correct responses, which heightens motivation and immediate learning gains (Kim & Arbel, 2019) [13].


Contextual UI (Flow-State Design) — The editor uses a distraction-free layout, hiding navigation during active coding challenges to maximize the Flow State. Flow, first described by Mihaly Csikszentmihalyi (1990), is a state of deep immersion characterized by complete absorption, loss of self-consciousness, and altered time perception [14]. Programming is particularly well-suited to flow because it provides clear goals, immediate feedback (code runs or fails), and incrementally scalable challenge — the three primary conditions Csikszentmihalyi identified for flow induction [15].

4. Gamification Logic & Behavioral Nudges
The platform utilizes game mechanics to drive consistent behavioral patterns rather than superficial engagement. A meta-analysis by Sailer & Homner (2020) synthesizing research on gamification in learning found significant small positive effects on cognitive (g=0.49), motivational (g=0.36), and behavioral (g=0.25) learning outcomes [16].

📚 Research Foundation: Gamification Meta-Analysis
Sailer & Homner's meta-analysis (2020, published in Educational Psychology Review) found that gamification benefits learning across cognitive, motivational, and behavioral domains, and that these findings align with Self-Determination Theory (Ryan & Deci, 2000). The effect on cognitive outcomes was stable even in studies employing high methodological rigor [16]. A systematic review of 40 studies (2023, PMC) confirmed a positive influence of gamification strategies on student motivation, though noted that long-term effects can decline if novelty wears off [17].


Mechanic
Implementation
Evidence & Cognitive Objective
Variable Rewards
Random XP Multipliers for accurate first-try completions
B.F. Skinner's operant conditioning research (1957) demonstrated that variable ratio reinforcement schedules produce the highest, most persistent response rates [18]. Neuroimaging confirms dopamine release is greater during anticipation of unpredictable rewards (Fiorillo et al., 2003) [19].
Loss Aversion (Streaks)
Streak visualizer; losing a multi-day streak acts as deterrent to quitting
Grounded in Kahneman & Tversky's Prospect Theory (1979): losses are psychologically ~2x as painful as equivalent gains [20]. A clinical trial (n=602) found participants at risk of losing a gamification level were 18.4% more likely to meet goals [21]. A 2017 Duolingo study confirmed streaks significantly boost session frequency [22].
Progress Scaffolding
Visual Knowledge Heatmaps showing mastery depth
Fulfills the Need for Competence from Self-Determination Theory (Ryan & Deci, 2000). SDT research across varied educational levels and cultural contexts shows that competence satisfaction enhances intrinsic motivation and predicts positive learning outcomes [23, 24]. Positive feedback enhances intrinsic motivation; competence-relevant visualizations serve this function [24].


4.1 Self-Determination Theory Integration
The gamification system is designed to satisfy all three basic psychological needs identified by SDT:
Autonomy — Users choose their learning path through the DAG, selecting which branches to pursue. SDT meta-analytic findings (Patall et al., 2008) support a positive effect of choice on intrinsic motivation [24].
Competence — Progressive difficulty calibration, mastery heatmaps, and XP tracking all provide competence-relevant feedback. SDT research shows that informational feedback (efficacy-relevant) enhances intrinsic motivation, while controlling feedback diminishes it [24].
Relatedness — Leaderboards and shared achievements create social connection. Research shows that intrinsic motivation flourishes when linked with a sense of security and relatedness [24].

📚 Critical Design Warning: Novelty Effect & Motivation Decay
A systematic review (PMC, 2023) found that while gamification strategies positively influence student motivation, long-term motivation can decline with prolonged exposure — a novelty effect [17]. The specification should incorporate countermeasures: rotating reward types, introducing new challenge modes periodically, and ensuring that intrinsic learning value (not just XP) is consistently visible to users. Over-reliance on extrinsic rewards risks undermining intrinsic motivation — a well-documented phenomenon in SDT research known as the "undermining effect" (Deci, Koestner & Ryan, 1999).



5. Spaced Repetition Implementation
To address the Ebbinghaus Forgetting Curve, the application includes a ReviewController.
📚 Research Foundation: The Forgetting Curve & Spacing Effect
Ebbinghaus (1885) first documented that memory decays exponentially: approximately 50% of newly learned information is lost within 30 minutes, and 70–80% within 24 hours without reinforcement [8]. A successful replication study (Murre & Dros, 2015, published in PLOS ONE) confirmed the original forgetting curve based on 70 hours of learning trials [9]. A comprehensive meta-analysis by Cepeda et al. (2006) reviewing a large body of literature confirmed that spacing out learning episodes reliably improves recall across a wide range of materials and time scales [10]. Modern spaced repetition algorithms (SM-2, FSRS) formalize the finding that each successful review increases the optimal interval before the next review is needed.


Implementation Logic:
1. Upon application mount, the ReviewController scans completedNodes in LocalStorage.
2. If currentDate - lastReviewed > interval(n), the node is flagged for Refresh.
3. A Daily Refresh prompt appears on the dashboard, offering a 1-minute quiz to re-solidify concepts before moving to new material.

5.1 Nuanced Evidence on Forgetting
While Ebbinghaus provides the foundational model, the specification acknowledges important nuances from modern research. Knowledge that is well-integrated into prior schemas is far more resistant to forgetting than isolated facts (Sweller et al., 2011) [4]. The forgetting curve applies most directly to isolated, context-free material — precisely the kind of factual recall (syntax, API names, operator precedence) that this platform's quizzes target. Conceptual understanding, tested through code-writing challenges, will naturally benefit from both the spacing effect and the deeper encoding that active problem-solving provides.
Additionally, Bjork & Bjork's "new theory of disuse" distinguishes between storage strength (how well-learned a memory is) and retrieval strength (how accessible it is at a given moment) [25]. The ReviewController's interval calculations should account for both dimensions — increasing intervals after successful retrievals while decreasing them after failures.
6. Security & Sandboxing
Since the app executes arbitrary user JavaScript:
Web Worker Isolation — Code is executed in a separate thread to prevent UI blocking.
eval() Mitigation — If using eval, it is strictly scoped within the Worker, which has no access to the main thread's DOM or LocalStorage objects, preventing XSS-based state manipulation.
This sandboxing ensures the "immediate feedback" loop (Section 3.2) operates without security compromises while maintaining sub-second execution times critical for sustaining the flow state [14].	
