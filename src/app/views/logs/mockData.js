// src/app/views/logs/mockData.js

// ─── Mirrors GET /api/v1/inspections/sessions response ─────
export const mockSessions = [
  {
    session_id: "550e8400-e29b-41d4-a716-446655440001",
    object_id: "A",
    object_name: "Pipe Joint A",
    scan_number: "1",
    side: "Top",
    video_filename: "A_scan",
    frames_extracted: 6,
    avg_quality_score: 87,
    total_defects_found: 0,
    overall_compliance_aws: true,
    overall_compliance_iso: true,
    status: "completed",
    compile_chart_url: "https://placehold.co/900x400/1a2035/4caf50?text=Compile+Chart+A",
    created_at: "2026-06-01T10:23:00Z",
    completed_at: "2026-06-01T10:23:05Z"
  },
  {
    session_id: "550e8400-e29b-41d4-a716-446655440002",
    object_id: "B",
    object_name: "Butt Weld B",
    scan_number: "2",
    side: "Bottom",
    video_filename: "B_scan",
    frames_extracted: 4,
    avg_quality_score: 52,
    total_defects_found: 3,
    overall_compliance_aws: false,
    overall_compliance_iso: false,
    status: "completed",
    compile_chart_url: "https://placehold.co/900x400/1a2035/f44336?text=Compile+Chart+B",
    created_at: "2026-06-02T14:05:00Z",
    completed_at: "2026-06-02T14:05:08Z"
  },
  {
    session_id: "550e8400-e29b-41d4-a716-446655440003",
    object_id: "C",
    object_name: "Fillet Weld C",
    scan_number: "1",
    side: "Left",
    video_filename: "C_scan",
    frames_extracted: 6,
    avg_quality_score: 73,
    total_defects_found: 1,
    overall_compliance_aws: true,
    overall_compliance_iso: false,
    status: "completed",
    compile_chart_url: "https://placehold.co/900x400/1a2035/ff9800?text=Compile+Chart+C",
    created_at: "2026-06-03T09:45:00Z",
    completed_at: "2026-06-03T09:45:06Z"
  }
];

// ─── Mirrors GET /api/v1/inspections/sessions/{session_id} response ─────
export const mockSessionDetails = {
  "550e8400-e29b-41d4-a716-446655440001": {
    session: {
      session_id: "550e8400-e29b-41d4-a716-446655440001",
      object_id: "A",
      object_name: "Pipe Joint A",
      scan_number: "1",
      side: "Top",
      welding_type: "Fillet Weld",
      welding_position: "Flat",
      remarks: "Routine inspection",
      frames_extracted: 6,
      avg_quality_score: 87,
      total_defects_found: 0,
      overall_compliance_aws: true,
      overall_compliance_iso: true,
      status: "completed",
      compile_chart_url: "https://placehold.co/900x400/1a2035/4caf50?text=Compile+Chart+A",
      created_at: "2026-06-01T10:23:00Z",
      completed_at: "2026-06-01T10:23:05Z"
    },
    per_pair_results: [
      {
        frame_index: 0,
        image_label: "A1",
        source_frame_a_label: "A1",
        source_frame_b_label: "A2",
        stitched_image_url: "https://placehold.co/700x300/1a2035/ffffff?text=Stitched+A1-A2",
        annotated_image_url: "https://placehold.co/700x300/1a2035/4caf50?text=Annotated+A1-A2",
        overall_result: "pass",
        weld_quality_score: 89,
        defects: [],
        recommendations: ["Maintain current travel speed"],
        model_notes: "Clean bead with full penetration."
      },
      {
        frame_index: 1,
        image_label: "A3",
        source_frame_a_label: "A3",
        source_frame_b_label: "A4",
        stitched_image_url: "https://placehold.co/700x300/1a2035/ffffff?text=Stitched+A3-A4",
        annotated_image_url: "https://placehold.co/700x300/1a2035/4caf50?text=Annotated+A3-A4",
        overall_result: "pass",
        weld_quality_score: 85,
        defects: [],
        recommendations: [],
        model_notes: "Uniform heat distribution observed."
      }
    ],
    statistical_summary: {
      total_frames_analyzed: 2,
      total_defects_found: 0,
      avg_quality_score: 87,
      min_quality_score: 85,
      max_quality_score: 89,
      pass_count: 2,
      fail_count: 0,
      review_count: 0,
      overall_compliance_aws: true,
      overall_compliance_iso: true,
      top_recommendations: ["Maintain current travel speed"]
    }
  },

  "550e8400-e29b-41d4-a716-446655440002": {
    session: {
      session_id: "550e8400-e29b-41d4-a716-446655440002",
      object_id: "B",
      object_name: "Butt Weld B",
      scan_number: "2",
      side: "Bottom",
      welding_type: "Butt Weld",
      welding_position: "Overhead",
      remarks: "Suspected porosity",
      frames_extracted: 4,
      avg_quality_score: 52,
      total_defects_found: 3,
      overall_compliance_aws: false,
      overall_compliance_iso: false,
      status: "completed",
      compile_chart_url: "https://placehold.co/900x400/1a2035/f44336?text=Compile+Chart+B",
      created_at: "2026-06-02T14:05:00Z",
      completed_at: "2026-06-02T14:05:08Z"
    },
    per_pair_results: [
      {
        frame_index: 0,
        image_label: "B1",
        source_frame_a_label: "B1",
        source_frame_b_label: "B2",
        stitched_image_url: "https://placehold.co/700x300/1a2035/ffffff?text=Stitched+B1-B2",
        annotated_image_url: "https://placehold.co/700x300/1a2035/f44336?text=Annotated+B1-B2",
        overall_result: "fail",
        weld_quality_score: 48,
        defects: [
          {
            defect_id: "D001",
            type: "porosity",
            severity: "high",
            description: "Scattered gas pores near HAZ",
            confidence: 0.91,
            bounding_box: { x: 0.12, y: 0.45, width: 0.08, height: 0.06 },
            length_mm: 3.2,
            depth_mm: 1.1,
            width_mm: 2.4,
            position: "near HAZ",
            standards_reference: "AWS D1.1 Clause 6",
            recommendation: "Grind and re-weld affected area"
          },
          {
            defect_id: "D002",
            type: "undercut",
            severity: "medium",
            description: "Undercut along left toe of weld bead",
            confidence: 0.85,
            bounding_box: { x: 0.55, y: 0.2, width: 0.15, height: 0.05 },
            length_mm: 5.0,
            depth_mm: 0.8,
            width_mm: 1.2,
            position: "left toe",
            standards_reference: "ISO 5817 Level B",
            recommendation: "Adjust electrode angle"
          }
        ],
        recommendations: ["Grind and re-weld affected area", "Adjust electrode angle"],
        model_notes: "Multiple defects detected. Rework recommended."
      },
      {
        frame_index: 1,
        image_label: "B3",
        source_frame_a_label: "B3",
        source_frame_b_label: "B4",
        stitched_image_url: "https://placehold.co/700x300/1a2035/ffffff?text=Stitched+B3-B4",
        annotated_image_url: "https://placehold.co/700x300/1a2035/ff9800?text=Annotated+B3-B4",
        overall_result: "review",
        weld_quality_score: 61,
        defects: [
          {
            defect_id: "D003",
            type: "lack_of_fusion",
            severity: "medium",
            description: "Partial lack of fusion at root pass",
            confidence: 0.78,
            bounding_box: { x: 0.3, y: 0.6, width: 0.1, height: 0.08 },
            length_mm: 4.1,
            depth_mm: 1.5,
            width_mm: 2.0,
            position: "root pass",
            standards_reference: "AWS D1.1 Clause 6",
            recommendation: "Increase amperage at root pass"
          }
        ],
        recommendations: ["Increase amperage at root pass"],
        model_notes: "Marginal fusion quality. Manual review advised."
      }
    ],
    statistical_summary: {
      total_frames_analyzed: 2,
      total_defects_found: 3,
      avg_quality_score: 52,
      min_quality_score: 48,
      max_quality_score: 61,
      pass_count: 0,
      fail_count: 1,
      review_count: 1,
      overall_compliance_aws: false,
      overall_compliance_iso: false,
      top_recommendations: ["Grind and re-weld affected area", "Adjust electrode angle", "Increase amperage at root pass"]
    }
  },

  "550e8400-e29b-41d4-a716-446655440003": {
    session: {
      session_id: "550e8400-e29b-41d4-a716-446655440003",
      object_id: "C",
      object_name: "Fillet Weld C",
      scan_number: "1",
      side: "Left",
      welding_type: "Fillet Weld",
      welding_position: "Vertical",
      remarks: "",
      frames_extracted: 6,
      avg_quality_score: 73,
      total_defects_found: 1,
      overall_compliance_aws: true,
      overall_compliance_iso: false,
      status: "completed",
      compile_chart_url: "https://placehold.co/900x400/1a2035/ff9800?text=Compile+Chart+C",
      created_at: "2026-06-03T09:45:00Z",
      completed_at: "2026-06-03T09:45:06Z"
    },
    per_pair_results: [
      {
        frame_index: 0,
        image_label: "C1",
        source_frame_a_label: "C1",
        source_frame_b_label: "C2",
        stitched_image_url: "https://placehold.co/700x300/1a2035/ffffff?text=Stitched+C1-C2",
        annotated_image_url: "https://placehold.co/700x300/1a2035/ff9800?text=Annotated+C1-C2",
        overall_result: "review",
        weld_quality_score: 70,
        defects: [
          {
            defect_id: "D004",
            type: "overlap",
            severity: "low",
            description: "Slight overlap on right side of bead",
            confidence: 0.72,
            bounding_box: { x: 0.7, y: 0.3, width: 0.06, height: 0.04 },
            length_mm: 2.0,
            depth_mm: 0.3,
            width_mm: 1.0,
            position: "right side",
            standards_reference: "ISO 5817 Level C",
            recommendation: "Improve weaving technique"
          }
        ],
        recommendations: ["Improve weaving technique"],
        model_notes: "Minor surface irregularity. No critical issues."
      },
      {
        frame_index: 1,
        image_label: "C3",
        source_frame_a_label: "C3",
        source_frame_b_label: "C4",
        stitched_image_url: "https://placehold.co/700x300/1a2035/ffffff?text=Stitched+C3-C4",
        annotated_image_url: "https://placehold.co/700x300/1a2035/4caf50?text=Annotated+C3-C4",
        overall_result: "pass",
        weld_quality_score: 78,
        defects: [],
        recommendations: [],
        model_notes: "Good bead profile in this section."
      }
    ],
    statistical_summary: {
      total_frames_analyzed: 2,
      total_defects_found: 1,
      avg_quality_score: 73,
      min_quality_score: 70,
      max_quality_score: 78,
      pass_count: 1,
      fail_count: 0,
      review_count: 1,
      overall_compliance_aws: true,
      overall_compliance_iso: false,
      top_recommendations: ["Improve weaving technique"]
    }
  }
};