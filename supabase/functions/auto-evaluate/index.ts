import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing server environment variables");
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { submissionId, round } = await req.json();

    if (!submissionId) {
      throw new Error("Submission ID is required");
    }

    const isRound2 = round === 2;
    const submissionTable = isRound2 ? 'submissions_round2' : 'submissions';
    const answersTable = isRound2 ? 'company_answers_round2' : 'company_answers';

    // 1. Fetch criteria and company answers
    const { data: criteria, error: criteriaError } = await adminClient
      .from('evaluation_criteria')
      .select('*')
      .order('display_order', { ascending: true });

    if (criteriaError) throw criteriaError;

    const { data: answers, error: answersError } = await adminClient
      .from(answersTable)
      .select('*')
      .eq('submission_id', submissionId);

    if (answersError) throw answersError;

    // 2. Calculate score
    let totalScore = 0;
    let maxPossibleScore = 0;
    let isDisqualified = false;
    let rejectionReason = "";
    const details = [];

    for (const criterion of criteria) {
      const answer = answers.find(a => a.criterion_id === criterion.id);
      const answerValue = answer ? answer.answer_value : 'reject'; // Default to reject if no answer
      
      const optionScores = criterion.options_scores || { accept: 100, provide: 50, reject: 0 };
      const scoreWeight = criterion.weight || 1;
      const points = (optionScores[answerValue] || 0);
      const weightedPoints = (points / 100) * scoreWeight;

      details.push({
        criterion_id: criterion.id,
        question: criterion.question_text,
        answer: answerValue,
        points: points,
        weightedPoints: weightedPoints,
        weight: scoreWeight
      });

      // Mandatory check
      if (criterion.is_mandatory && answerValue === 'reject') {
        isDisqualified = true;
        rejectionReason = `تم الرفض بسبب عدم استيفاء معيار إلزامي: ${criterion.question_text}`;
      }

      totalScore += weightedPoints;
      maxPossibleScore += scoreWeight;
    }

    const finalPercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

    // 3. Update submission
    const updateData = {
      auto_score: isDisqualified ? 0 : parseFloat(finalPercentage.toFixed(2)),
      auto_rejection_reason: isDisqualified ? rejectionReason : null,
      evaluation_details: JSON.stringify(details),
      last_updated: new Date().toISOString()
    };

    const { error: updateError } = await adminClient
      .from(submissionTable)
      .update(updateData)
      .eq('id', submissionId);

    if (updateError) throw updateError;

    // 4. Recalculate rankings for all final submissions in this round
    const { data: allSubs, error: subsError } = await adminClient
      .from(submissionTable)
      .select('id, auto_score')
      .eq('status', 'final')
      .is('auto_rejection_reason', null)
      .order('auto_score', { ascending: false });

    if (subsError) throw subsError;

    if (allSubs && allSubs.length > 0) {
      const rankUpdates = allSubs.map((sub, index) => ({
        id: sub.id,
        auto_ranking: index + 1
      }));

      // Bulk update rankings
      for (const update of rankUpdates) {
        await adminClient
          .from(submissionTable)
          .update({ auto_ranking: update.auto_ranking })
          .eq('id', update.id);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      score: finalPercentage, 
      disqualified: isDisqualified,
      reason: rejectionReason 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
