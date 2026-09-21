import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette
    C_DARK_BG = RGBColor(10, 15, 29)      # #0A0F1D Dark Slate
    C_DARK_CARD = RGBColor(19, 27, 46)    # #131B2E Dark Card
    C_WHITE = RGBColor(255, 255, 255)     # #FFFFFF
    C_LIGHT_BG = RGBColor(248, 250, 252)  # #F8FAFC
    C_CARD_BG = RGBColor(255, 255, 255)   # #FFFFFF
    C_CARD_BORDER = RGBColor(226, 232, 240) # #E2E8F0
    C_EMERALD = RGBColor(16, 185, 129)    # #10B981 Accent Green
    C_EMERALD_DARK = RGBColor(5, 150, 105) # #059669
    C_AMBER = RGBColor(245, 158, 11)      # #F59E0B Accent Amber
    C_RED = RGBColor(239, 68, 68)         # #EF4444
    C_BLUE = RGBColor(37, 99, 235)        # #2563EB
    C_TEXT_DARK = RGBColor(15, 23, 42)    # #0F172A
    C_TEXT_MUTED = RGBColor(100, 116, 139)# #64748B
    C_TEXT_LIGHT = RGBColor(241, 245, 249)# #F1F5F9

    # Asset paths
    hero_img = r"c:\Users\pranjal\OneDrive\Documents\project\platform\client\public\foodwatch_hero_bg.jpg"
    problem_img = r"c:\Users\pranjal\OneDrive\Documents\project\platform\client\public\food_problem_3d.jpg"
    rescue_img = r"c:\Users\pranjal\OneDrive\Documents\project\platform\client\public\food_rescue_3d.jpg"

    def add_bg(slide, color):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_header(slide, pill_text, title_text, subtitle_text=None, is_dark=False):
        # Header category pill
        pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.45), Inches(3.2), Inches(0.32))
        pill.fill.solid()
        pill.fill.fore_color.rgb = RGBColor(6, 78, 59) if is_dark else RGBColor(209, 250, 229)
        pill.line.fill.background()
        p = pill.text_frame.paragraphs[0]
        p.text = pill_text.upper()
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = RGBColor(52, 211, 153) if is_dark else C_EMERALD_DARK
        p.alignment = PP_ALIGN.CENTER
        pill.text_frame.vertical_anchor = MSO_ANCHOR.MIDDLE

        # Title
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.82), Inches(11.7), Inches(0.65))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = C_WHITE if is_dark else C_TEXT_DARK

        if subtitle_text:
            p2 = tf.add_paragraph()
            p2.text = subtitle_text
            p2.font.size = Pt(11)
            p2.font.color.rgb = RGBColor(148, 163, 184) if is_dark else C_TEXT_MUTED
            p2.space_before = Pt(3)

    def add_footer(slide, current_slide, total_slides=12, is_dark=False):
        # Left footer
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(7.05), Inches(6.0), Inches(0.3))
        tf = tb.text_frame
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = "FoodWatch — SDG 2 Zero Hunger Surplus Food Platform | 1M1B Initiative"
        p.font.size = Pt(9)
        p.font.color.rgb = RGBColor(100, 116, 139) if is_dark else RGBColor(148, 163, 184)

        # Right footer
        tb2 = slide.shapes.add_textbox(Inches(9.5), Inches(7.05), Inches(3.0), Inches(0.3))
        tf2 = tb2.text_frame
        tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = 0
        p2 = tf2.paragraphs[0]
        p2.text = f"Slide {current_slide} of {total_slides}"
        p2.alignment = PP_ALIGN.RIGHT
        p2.font.size = Pt(9)
        p2.font.color.rgb = RGBColor(100, 116, 139) if is_dark else RGBColor(148, 163, 184)

    # =========================================================================
    # SLIDE 1: Title Slide (Dark Elegance)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_bg(s1, C_DARK_BG)

    # Decorative emerald glow rectangle on top
    glow = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.1))
    glow.fill.solid()
    glow.fill.fore_color.rgb = C_EMERALD
    glow.line.fill.background()

    # Title content box
    tb = s1.shapes.add_textbox(Inches(0.9), Inches(1.1), Inches(6.5), Inches(5.0))
    tf = tb.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = "1M1B INITIATIVE  •  UN SDG 2: ZERO HUNGER"
    p0.font.size = Pt(11)
    p0.font.bold = True
    p0.font.color.rgb = C_EMERALD

    p1 = tf.add_paragraph()
    p1.text = "FoodWatch"
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = C_WHITE
    p1.space_before = Pt(12)

    p2 = tf.add_paragraph()
    p2.text = "Real-Time Surplus Food Redistribution & Policy Intelligence Platform"
    p2.font.size = Pt(18)
    p2.font.color.rgb = RGBColor(203, 213, 225)
    p2.space_before = Pt(8)

    p3 = tf.add_paragraph()
    p3.text = "Connecting restaurants, banquet halls, and commercial donors with local grassroots NGOs, orphanages, and community kitchens in real time before fresh food perishes."
    p3.font.size = Pt(12)
    p3.font.color.rgb = RGBColor(148, 163, 184)
    p3.space_before = Pt(16)

    # Presenter Pill Box
    pill = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(5.5), Inches(5.8), Inches(0.95))
    pill.fill.solid()
    pill.fill.fore_color.rgb = C_DARK_CARD
    pill.line.color.rgb = RGBColor(30, 41, 59)
    ptf = pill.text_frame
    ptf.margin_left = Inches(0.2)
    pp1 = ptf.paragraphs[0]
    pp1.text = "🌱 Developed for 1M1B (1 Million for 1 Billion) Foundation"
    pp1.font.size = Pt(11)
    pp1.font.bold = True
    pp1.font.color.rgb = C_WHITE
    pp2 = ptf.add_paragraph()
    pp2.text = "Full-Stack Web Architecture | Policy Portal | AI Assistant | 2026"
    pp2.font.size = Pt(9.5)
    pp2.font.color.rgb = C_EMERALD
    pp2.space_before = Pt(2)

    # Right Hero Image Card
    if os.path.exists(hero_img):
        try:
            img_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.7), Inches(1.1), Inches(4.7), Inches(5.35))
            img_card.fill.solid()
            img_card.fill.fore_color.rgb = C_DARK_CARD
            img_card.line.color.rgb = RGBColor(30, 41, 59)
            s1.shapes.add_picture(hero_img, Inches(7.85), Inches(1.25), width=Inches(4.4), height=Inches(3.3))
            
            # Badge underneath image
            ib = s1.shapes.add_textbox(Inches(7.85), Inches(4.7), Inches(4.4), Inches(1.6))
            itf = ib.text_frame
            itf.word_wrap = True
            ip1 = itf.paragraphs[0]
            ip1.text = "Real-Time Geospatial Coordination"
            ip1.font.size = Pt(13)
            ip1.font.bold = True
            ip1.font.color.rgb = C_WHITE
            ip2 = itf.add_paragraph()
            ip2.text = "Live interactive Leaflet maps, dynamic shelf-life countdowns, and atomic lock claims to eliminate urban food waste."
            ip2.font.size = Pt(10)
            ip2.font.color.rgb = RGBColor(148, 163, 184)
            ip2.space_before = Pt(4)
        except Exception as e:
            print("Hero image add failed:", e)

    add_footer(s1, 1, 12, is_dark=True)

    # =========================================================================
    # SLIDE 2: Executive Summary & Project Vision
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_bg(s2, C_LIGHT_BG)
    add_header(s2, "EXECUTIVE SUMMARY", "Project Overview & Strategic Vision", "A comprehensive ecosystem tackling food waste through technology, policy, and AI.")

    # 3 Strategic Pillar Cards
    pillars = [
        ("01", "Hyperlocal Redistribution Platform", C_EMERALD_DARK,
         "Full-stack MERN platform connecting food surplus donors (restaurants, caterers, hotels) with verified NGOs and shelters within a critical 2-hour window before cooked food spoils.",
         ["Sub-minute donation listings", "Interactive Leaflet geospatial map", "Atomic race-condition safe claiming", "Live impact tracker (meals & CO2)"]),
        ("02", "National Policy & Research Hub", C_BLUE,
         "Data-driven portal synthesizing primary-source loss datasets from ICAR, CAG, and NITI Aayog, alongside actionable guidance on key government schemes.",
         ["ICAR & FAO post-harvest metrics", "PMKSY & RKVY cold-chain analysis", "APMC Mandi price distortion studies", "Citizen & community action frameworks"]),
        ("03", "AI Assistant: 'IBM Bob'", RGBColor(124, 58, 237),
         "Conversational AI advisor inspired by IBM watsonx, engineered to answer complex questions regarding food preservation, government subsidies, and logistics.",
         ["Instant scheme eligibility answers", "Storage & hygiene guidelines", "NGO onboarding assistance", "FSSAI compliance recommendations"])
    ]

    for i, (num, title, color, desc, bullets) in enumerate(pillars):
        left = Inches(0.8 + i * 3.98)
        card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.8), Inches(3.75), Inches(4.3))
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD_BG
        card.line.color.rgb = C_CARD_BORDER
        card.line.width = Pt(1)

        # Number badge
        nb = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left + Inches(0.25), Inches(2.05), Inches(0.7), Inches(0.35))
        nb.fill.solid()
        nb.fill.fore_color.rgb = color
        nb.line.fill.background()
        np = nb.text_frame.paragraphs[0]
        np.text = num
        np.font.size = Pt(12)
        np.font.bold = True
        np.font.color.rgb = C_WHITE
        np.alignment = PP_ALIGN.CENTER
        nb.text_frame.vertical_anchor = MSO_ANCHOR.MIDDLE

        # Card Text
        tb = s2.shapes.add_textbox(left + Inches(0.25), Inches(2.55), Inches(3.25), Inches(3.4))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = C_TEXT_DARK

        p_desc = tf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(10)
        p_desc.font.color.rgb = C_TEXT_MUTED
        p_desc.space_before = Pt(6)

        p_div = tf.add_paragraph()
        p_div.text = "KEY CAPABILITIES:"
        p_div.font.size = Pt(9)
        p_div.font.bold = True
        p_div.font.color.rgb = color
        p_div.space_before = Pt(10)

        for b in bullets:
            bp = tf.add_paragraph()
            bp.text = f"• {b}"
            bp.font.size = Pt(9.5)
            bp.font.color.rgb = C_TEXT_DARK
            bp.space_before = Pt(3)

    # Bottom summary banner
    banner = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.25), Inches(11.7), Inches(0.65))
    banner.fill.solid()
    banner.fill.fore_color.rgb = RGBColor(236, 253, 245)
    banner.line.color.rgb = RGBColor(167, 243, 208)
    btf = banner.text_frame
    bp = btf.paragraphs[0]
    bp.text = "🎯 Core Mission: Accelerate UN SDG 2 (Zero Hunger) by transforming uncoordinated food waste into dignified community nutrition."
    bp.font.size = Pt(10.5)
    bp.font.bold = True
    bp.font.color.rgb = C_EMERALD_DARK
    bp.alignment = PP_ALIGN.CENTER
    banner.text_frame.vertical_anchor = MSO_ANCHOR.MIDDLE

    add_footer(s2, 2, 12)

    # =========================================================================
    # SLIDE 3: The Problem — Systemic Food Waste in India
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_bg(s3, C_LIGHT_BG)
    add_header(s3, "THE CRISIS", "The Grand Paradox: Massive Waste Amid Chronic Hunger", "India's food distribution crisis stems from broken logistics, missing cold chains, and lack of coordination.")

    # Left Column: 3 Major Stat Cards
    stats = [
        ("₹1.53 Lakh Crore", "Annual Value of Food Lost", "According to ICAR (2022) and NITI Aayog, food loss across post-harvest and supply chain amounts to 1.53 Lakh Cr annually.", C_RED),
        ("67 Million MT", "Food Wasted Annually", "India throws away over 67 million metric tonnes of food each year — equal to the total food consumption of the state of Bihar.", C_AMBER),
        ("111th / 125", "Global Hunger Index Rank", "Despite record agricultural yields, severe child wasting (18.7%) and micronutrient deficiencies afflict vulnerable populations.", RGBColor(220, 38, 38))
    ]

    for i, (val, title, note, col) in enumerate(stats):
        top = Inches(1.8 + i * 1.6)
        card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), top, Inches(5.8), Inches(1.45))
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD_BG
        card.line.color.rgb = C_CARD_BORDER

        # Left accent stripe
        stripe = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), top, Inches(0.12), Inches(1.45))
        stripe.fill.solid()
        stripe.fill.fore_color.rgb = col
        stripe.line.fill.background()

        tb = s3.shapes.add_textbox(Inches(1.1), top + Inches(0.1), Inches(5.3), Inches(1.25))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p_val = tf.paragraphs[0]
        p_val.text = val
        p_val.font.size = Pt(22)
        p_val.font.bold = True
        p_val.font.color.rgb = col

        p_t = tf.add_paragraph()
        p_t.text = title
        p_t.font.size = Pt(11)
        p_t.font.bold = True
        p_t.font.color.rgb = C_TEXT_DARK

        p_n = tf.add_paragraph()
        p_n.text = note
        p_n.font.size = Pt(9)
        p_n.font.color.rgb = C_TEXT_MUTED

    # Right Column: Visual and Breakdown Card
    right_card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(1.8), Inches(5.6), Inches(4.7))
    right_card.fill.solid()
    right_card.fill.fore_color.rgb = C_CARD_BG
    right_card.line.color.rgb = C_CARD_BORDER

    if os.path.exists(problem_img):
        try:
            s3.shapes.add_picture(problem_img, Inches(7.1), Inches(2.0), width=Inches(5.2), height=Inches(2.5))
        except Exception as e:
            print("Problem image error:", e)

    rtb = s3.shapes.add_textbox(Inches(7.1), Inches(4.6), Inches(5.2), Inches(1.8))
    rtf = rtb.text_frame
    rtf.word_wrap = True
    rp1 = rtf.paragraphs[0]
    rp1.text = "Why Cooked Food Is Discarded Nightly:"
    rp1.font.size = Pt(12)
    rp1.font.bold = True
    rp1.font.color.rgb = C_TEXT_DARK

    rp2 = rtf.add_paragraph()
    rp2.text = "• Unpredictable Event Surplus: Banquet halls and caterers over-prepare by 15-25% to avoid shortages.\n• Missing Real-Time Channels: No quick directory of nearby shelters with active night-time capacity.\n• Liability & Trust Hesitation: Fear of food safety liabilities without verified hygiene declarations."
    rp2.font.size = Pt(9.5)
    rp2.font.color.rgb = C_TEXT_MUTED
    rp2.space_before = Pt(4)

    add_footer(s3, 3, 12)

    # =========================================================================
    # SLIDE 4: Empirical Data & Policy Analysis
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_bg(s4, C_LIGHT_BG)
    add_header(s4, "DATA & RESEARCH", "Primary-Source Research & Supply Chain Bottlenecks", "Synthesized from national audits (CAG, ICAR, Shanta Kumar Committee, NHB).")

    # 4 Data Grid Cards
    cards_data = [
        ("COLD CHAIN CONCENTRATION", "75%", "Concentrated in 5 States",
         "India has 8,186 cold storage units (37.4M MT capacity), but 75% of capacity is clustered in just UP, WB, Punjab, Gujarat, and MP. Rural India remains almost entirely disconnected.",
         "National Horticulture Board (NHB 2023) / MoFPI", C_AMBER),
        ("PERISHABLE COLD CHAIN", "11%", "Produce in Integrated Chain",
         "Only 11% of India's perishable fruits and vegetables move through an unbroken temperature-controlled cold chain, causing rapid biological decomposition.",
         "Ministry of Food Processing Industries (MoFPI 2023)", C_RED),
        ("MSP BENEFIT GAP", "6%", "Farmers Benefiting from MSP",
         "The Shanta Kumar Committee Report documented that only 6% of Indian farmers receive official MSP rates. The remaining 94% suffer distress sales and lack storage.",
         "High Level Committee on Agri Marketing (2015)", C_BLUE),
        ("POST-HARVEST TRANSIT LOSS", "7–15%", "Weight Lost in Transport",
         "ICAR studies found 7% to 15% vegetable weight loss during transport due to rough handling, non-ventilated vehicles, and 41% unpaved rural road networks.",
         "ICAR Assessment (2022) / PMGSY Progress Report", C_EMERALD_DARK)
    ]

    for i, (pill, stat, stat_title, desc, src, col) in enumerate(cards_data):
        row = i // 2
        col_idx = i % 2
        left = Inches(0.8 + col_idx * 5.95)
        top = Inches(1.8 + row * 2.4)

        c = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(5.75), Inches(2.25))
        c.fill.solid()
        c.fill.fore_color.rgb = C_CARD_BG
        c.line.color.rgb = C_CARD_BORDER

        # Category pill
        cp = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left + Inches(0.2), top + Inches(0.2), Inches(2.8), Inches(0.28))
        cp.fill.solid()
        cp.fill.fore_color.rgb = RGBColor(241, 245, 249)
        cp.line.fill.background()
        cpp = cp.text_frame.paragraphs[0]
        cpp.text = pill
        cpp.font.size = Pt(8.5)
        cpp.font.bold = True
        cpp.font.color.rgb = col
        cp.text_frame.vertical_anchor = MSO_ANCHOR.MIDDLE

        tb = s4.shapes.add_textbox(left + Inches(0.2), top + Inches(0.55), Inches(5.35), Inches(1.6))
        tf = tb.text_frame
        tf.word_wrap = True

        p_stat = tf.paragraphs[0]
        p_stat.text = f"{stat} — {stat_title}"
        p_stat.font.size = Pt(14)
        p_stat.font.bold = True
        p_stat.font.color.rgb = col

        p_desc = tf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(9.5)
        p_desc.font.color.rgb = C_TEXT_DARK
        p_desc.space_before = Pt(4)

        p_src = tf.add_paragraph()
        p_src.text = f"📄 Source: {src}"
        p_src.font.size = Pt(8)
        p_src.font.color.rgb = C_TEXT_MUTED
        p_src.space_before = Pt(4)

    add_footer(s4, 4, 12)

    # =========================================================================
    # SLIDE 5: The FoodWatch Solution
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_bg(s5, C_LIGHT_BG)
    add_header(s5, "OUR SOLUTION", "FoodWatch: Real-Time Geospatial Food Rescue", "A technology platform engineered to bridge donors and grassroots relief agencies within minutes.")

    # Left Column: 4 Core Solution Pillars
    sol_points = [
        ("⚡ 60-Second Surplus Listing", "Kitchens and banquet managers can post meals in under a minute with portions, photos, preparation timestamps, and dietary tags (Veg, Non-Veg, Vegan)."),
        ("🗺️ Interactive Geospatial Map", "Built on Leaflet and OpenStreetMap. Verified NGOs visualize listings within 5km/10km/25km radiuses with immediate distance sorting."),
        ("⏳ Automated Shelf-Life Engine", "Dynamic server-calculated countdown timers. Warning notifications trigger when items approach expiry, preventing spoiled food delivery."),
        ("🛡️ Trust & Verification Shield", "Mandatory food hygiene declarations, phone OTP verification for accountability, and 1-5 star post-collection donor review system.")
    ]

    left_w = Inches(6.5)
    for i, (title, desc) in enumerate(sol_points):
        top = Inches(1.8 + i * 1.18)
        c = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), top, left_w, Inches(1.08))
        c.fill.solid()
        c.fill.fore_color.rgb = C_CARD_BG
        c.line.color.rgb = C_CARD_BORDER

        tb = s5.shapes.add_textbox(Inches(1.0), top + Inches(0.08), Inches(6.1), Inches(0.92))
        tf = tb.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(11.5)
        p1.font.bold = True
        p1.font.color.rgb = C_EMERALD_DARK

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(9)
        p2.font.color.rgb = C_TEXT_MUTED
        p2.space_before = Pt(2)

    # Right Column: Visual Showcase Card
    rc = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.6), Inches(1.8), Inches(4.9), Inches(4.8))
    rc.fill.solid()
    rc.fill.fore_color.rgb = C_CARD_BG
    rc.line.color.rgb = C_CARD_BORDER

    if os.path.exists(rescue_img):
        try:
            s5.shapes.add_picture(rescue_img, Inches(7.8), Inches(2.0), width=Inches(4.5), height=Inches(2.6))
        except Exception as e:
            print("Rescue img error:", e)

    rtb = s5.shapes.add_textbox(Inches(7.8), Inches(4.75), Inches(4.5), Inches(1.7))
    rtf = rtb.text_frame
    rtf.word_wrap = True
    p = rtf.paragraphs[0]
    p.text = "Closing the Urban Surplus Loop"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_TEXT_DARK

    p_body = rtf.add_paragraph()
    p_body.text = "FoodWatch turns an otherwise discarded resource into high-protein, balanced nourishment for underprivileged children, elderly homes, and migrant shelters."
    p_body.font.size = Pt(9.5)
    p_body.font.color.rgb = C_TEXT_MUTED
    p_body.space_before = Pt(4)

    add_footer(s5, 5, 12)

    # =========================================================================
    # SLIDE 6: End-to-End System Workflow
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_bg(s6, C_LIGHT_BG)
    add_header(s6, "LIFECYCLE", "End-to-End Operational Workflow", "From kitchen surplus creation to verified NGO distribution and carbon accounting.")

    # 5 Sequential Process Steps
    steps = [
        ("STEP 1", "Surplus Listed", "Donor uploads meal info, portions, shelf-life, and location. Signs hygiene declaration.", C_EMERALD_DARK),
        ("STEP 2", "Expiry Calculated", "Engine sets expiresAt = preparedAt + shelfLife. Listing appears LIVE on map.", C_BLUE),
        ("STEP 3", "Discovery & Filter", "NGOs discover food on Leaflet map, filter by dietary tags (Veg/Vegan) and distance.", RGBColor(124, 58, 237)),
        ("STEP 4", "Atomic Claim", "System uses atomic findOneAndUpdate to lock listing and prevent duplicate claims.", C_AMBER),
        ("STEP 5", "Handover & Review", "NGO collects food, marks collected. Donor receives 1-5 star review. Impact calculated.", C_EMERALD_DARK)
    ]

    for i, (st, title, desc, col) in enumerate(steps):
        left = Inches(0.8 + i * 2.38)
        c = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.8), Inches(2.22), Inches(3.2))
        c.fill.solid()
        c.fill.fore_color.rgb = C_CARD_BG
        c.line.color.rgb = C_CARD_BORDER

        # Step Badge
        sb = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left + Inches(0.2), Inches(2.0), Inches(1.82), Inches(0.35))
        sb.fill.solid()
        sb.fill.fore_color.rgb = col
        sb.line.fill.background()
        sp = sb.text_frame.paragraphs[0]
        sp.text = st
        sp.font.size = Pt(10)
        sp.font.bold = True
        sp.font.color.rgb = C_WHITE
        sp.alignment = PP_ALIGN.CENTER
        sb.text_frame.vertical_anchor = MSO_ANCHOR.MIDDLE

        tb = s6.shapes.add_textbox(left + Inches(0.15), Inches(2.45), Inches(1.92), Inches(2.4))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = C_TEXT_DARK
        p.space_before = Pt(4)

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(9)
        p2.font.color.rgb = C_TEXT_MUTED
        p2.space_before = Pt(6)

    # Bottom Background Engine Card
    bg_box = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.2), Inches(11.7), Inches(1.5))
    bg_box.fill.solid()
    bg_box.fill.fore_color.rgb = RGBColor(241, 245, 249)
    bg_box.line.color.rgb = C_CARD_BORDER

    btb = s6.shapes.add_textbox(Inches(1.0), Inches(5.3), Inches(11.3), Inches(1.3))
    btf = btb.text_frame
    btf.word_wrap = True
    bp1 = btf.paragraphs[0]
    bp1.text = "⚙️ Automated Background Engine (node-cron Active Job Queue)"
    bp1.font.size = Pt(12)
    bp1.font.bold = True
    bp1.font.color.rgb = C_TEXT_DARK

    bp2 = btf.add_paragraph()
    bp2.text = "• Expiry Watchdog: Runs every 5 minutes. Evaluates all active donations against UTC server time.\n• Urgent Alerts: Sends SMS and in-app alerts to donor if listing remains unclaimed 30 minutes prior to expiry.\n• Auto-Prune: Flips expired items to EXPIRED status, removing them from the public map to guarantee food safety."
    bp2.font.size = Pt(9.5)
    bp2.font.color.rgb = C_TEXT_MUTED
    bp2.space_before = Pt(4)

    add_footer(s6, 6, 12)

    # =========================================================================
    # SLIDE 7: Technical Stack & Engineering Highlights
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_bg(s7, C_LIGHT_BG)
    add_header(s7, "TECH STACK", "Robust Full-Stack Engineering Architecture", "Built for high availability, transactional integrity, and responsive user experience.")

    tech_cols = [
        ("FRONTEND ECOSYSTEM", C_BLUE, [
            ("React 18 & React Router v6", "Component-driven SPA architecture with client-side routing."),
            ("Leaflet & OpenStreetMap", "Geospatial mapping without costly proprietary API vendor lock-in."),
            ("Recharts Library", "Dynamic data visualization for impact metrics and trends."),
            ("Vanilla CSS Design Tokens", "Modern responsive design with CSS variables, zero framework bloat.")
        ]),
        ("BACKEND PLATFORM", C_EMERALD_DARK, [
            ("Node.js & Express.js", "Asynchronous, event-driven RESTful API endpoints."),
            ("node-cron Job Engine", "Automated background jobs executing every 5 minutes."),
            ("JWT & Bcrypt Security", "Stateless authentication with salt-hashed password security."),
            ("SMS OTP Gateway Support", "MSG91/Twilio integration with local dev console fallback.")
        ]),
        ("DATABASE & PRIVACY", RGBColor(124, 58, 237), [
            ("MongoDB with Mongoose", "Flexible NoSQL schema handling rapid status state transitions."),
            ("Atomic findOneAndUpdate", "Eliminates race conditions when multiple NGOs claim simultaneously."),
            ("DPDP Act Compliance", "Zero raw 12-digit Aadhaar storage; uses optional last 4 digits only."),
            ("Comprehensive Seeds", "Preloaded test scenarios for donors, recipients, and claims.")
        ])
    ]

    for i, (title, col, items) in enumerate(tech_cols):
        left = Inches(0.8 + i * 3.98)
        c = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.8), Inches(3.75), Inches(4.9))
        c.fill.solid()
        c.fill.fore_color.rgb = C_CARD_BG
        c.line.color.rgb = C_CARD_BORDER

        # Header bar
        hb = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left + Inches(0.2), Inches(2.0), Inches(3.35), Inches(0.4))
        hb.fill.solid()
        hb.fill.fore_color.rgb = col
        hb.line.fill.background()
        hp = hb.text_frame.paragraphs[0]
        hp.text = title
        hp.font.size = Pt(11)
        hp.font.bold = True
        hp.font.color.rgb = C_WHITE
        hp.alignment = PP_ALIGN.CENTER
        hb.text_frame.vertical_anchor = MSO_ANCHOR.MIDDLE

        tb = s7.shapes.add_textbox(left + Inches(0.2), Inches(2.55), Inches(3.35), Inches(4.0))
        tf = tb.text_frame
        tf.word_wrap = True

        for idx, (it_t, it_d) in enumerate(items):
            p = tf.add_paragraph() if idx > 0 else tf.paragraphs[0]
            p.text = it_t
            p.font.size = Pt(11)
            p.font.bold = True
            p.font.color.rgb = C_TEXT_DARK
            if idx > 0:
                p.space_before = Pt(8)

            pd = tf.add_paragraph()
            pd.text = it_d
            pd.font.size = Pt(9)
            pd.font.color.rgb = C_TEXT_MUTED
            pd.space_before = Pt(2)

    add_footer(s7, 7, 12)

    # =========================================================================
    # SLIDE 8: Core Engineering Innovations
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_bg(s8, C_LIGHT_BG)
    add_header(s8, "CORE FEATURES", "Engineering Highlights & Concurrency Handling", "Purpose-built architectural mechanisms solving the real-world operational challenges of food redistribution.")

    innovations = [
        ("Atomic Claim Locks (Anti-Race Condition)",
         "In high-density urban areas, popular surplus listings can be targeted by multiple shelters at once. Standard read-then-write updates cause double-claiming disasters.",
         "Technical Solution: Leverages MongoDB's atomic findOneAndUpdate with status === 'available' filter. The first receiver acquires an exclusive lock; subsequent calls receive HTTP 409 Conflict with friendly UI explanations.",
         C_EMERALD_DARK),
        ("Dynamic Shelf-Life & Expiry Math",
         "Food safety is non-negotiable. Static pickup times fail when events conclude earlier or later than planned.",
         "Technical Solution: Computes precise expiresAt from preparation timestamp and certified shelf-life hours. Displays real-time countdown badges on cards and auto-delists items upon expiry.",
         C_BLUE),
        ("Phone OTP & DPDP Act Privacy Guard",
         "NGOs and donors require mutual trust without violating India's Digital Personal Data Protection (DPDP) Act 2023.",
         "Technical Solution: Verification relies on phone OTP. Strict data minimization ensures no full 12-digit Aadhaar numbers are collected or stored in database records.",
         RGBColor(124, 58, 237)),
        ("Two-Way Feedback & Accountability Loop",
         "Eliminating poor-quality donations through social accountability and donor recognition.",
         "Technical Solution: Post-collection review prompt where recipient NGOs rate food freshness, hygiene, and packaging on a 1-to-5 star scale, building an immutable community trust score.",
         C_AMBER)
    ]

    for i, (title, prob, sol, col) in enumerate(innovations):
        row = i // 2
        col_idx = i % 2
        left = Inches(0.8 + col_idx * 5.95)
        top = Inches(1.8 + row * 2.45)

        c = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(5.75), Inches(2.3))
        c.fill.solid()
        c.fill.fore_color.rgb = C_CARD_BG
        c.line.color.rgb = C_CARD_BORDER

        # Left stripe
        st = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(0.12), Inches(2.3))
        st.fill.solid()
        st.fill.fore_color.rgb = col
        st.line.fill.background()

        tb = s8.shapes.add_textbox(left + Inches(0.25), top + Inches(0.15), Inches(5.35), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_DARK

        p2 = tf.add_paragraph()
        p2.text = f"Challenge: {prob}"
        p2.font.size = Pt(9)
        p2.font.color.rgb = C_TEXT_MUTED
        p2.space_before = Pt(4)

        p3 = tf.add_paragraph()
        p3.text = sol
        p3.font.size = Pt(9)
        p3.font.color.rgb = C_TEXT_DARK
        p3.space_before = Pt(4)

    add_footer(s8, 8, 12)

    # =========================================================================
    # SLIDE 9: Real-Time Environmental & Social Impact
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_bg(s9, C_LIGHT_BG)
    add_header(s9, "IMPACT METRICS", "Quantifying Social & Environmental Impact", "Automated real-time mathematical calculations converting rescued meals into environmental equivalents.")

    # 3 Large Metric Cards
    metrics = [
        ("MEALS RESCUED", "2.5x", "Meals per kg Rescued",
         "Every kilogram of surplus cooked food collected provides approximately 2.5 wholesome, calorically sufficient meal portions.",
         C_EMERALD_DARK),
        ("CO2e DIVERTED", "2.5 kg", "Emissions Avoided / kg",
         "Prevents organic waste from entering landfills, stopping anaerobic decay and high-potency methane gas release.",
         C_BLUE),
        ("VIRTUAL WATER", "1,000 L", "Water Saved / kg",
         "Preserves the agricultural irrigation water already invested into cultivating, harvesting, and preparing the food.",
         C_AMBER)
    ]

    for i, (pill, val, lbl, desc, col) in enumerate(metrics):
        left = Inches(0.8 + i * 3.98)
        c = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.8), Inches(3.75), Inches(2.3))
        c.fill.solid()
        c.fill.fore_color.rgb = C_CARD_BG
        c.line.color.rgb = C_CARD_BORDER

        # Pill
        cp = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left + Inches(0.2), Inches(2.0), Inches(2.2), Inches(0.28))
        cp.fill.solid()
        cp.fill.fore_color.rgb = RGBColor(241, 245, 249)
        cp.line.fill.background()
        p = cp.text_frame.paragraphs[0]
        p.text = pill
        p.font.size = Pt(8.5)
        p.font.bold = True
        p.font.color.rgb = col
        cp.text_frame.vertical_anchor = MSO_ANCHOR.MIDDLE

        tb = s9.shapes.add_textbox(left + Inches(0.2), Inches(2.35), Inches(3.35), Inches(1.6))
        tf = tb.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = val
        p1.font.size = Pt(28)
        p1.font.bold = True
        p1.font.color.rgb = col

        p2 = tf.add_paragraph()
        p2.text = lbl
        p2.font.size = Pt(11)
        p2.font.bold = True
        p2.font.color.rgb = C_TEXT_DARK

        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(8.5)
        p3.font.color.rgb = C_TEXT_MUTED
        p3.space_before = Pt(2)

    # Bottom Impact Dashboard Preview Card
    btm_card = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.35), Inches(11.7), Inches(2.35))
    btm_card.fill.solid()
    btm_card.fill.fore_color.rgb = C_CARD_BG
    btm_card.line.color.rgb = C_CARD_BORDER

    btb = s9.shapes.add_textbox(Inches(1.1), Inches(4.5), Inches(11.1), Inches(2.0))
    btf = btb.text_frame
    btf.word_wrap = True

    bp1 = btf.paragraphs[0]
    bp1.text = "Transparent Public Impact Dashboard"
    bp1.font.size = Pt(13)
    bp1.font.bold = True
    bp1.font.color.rgb = C_TEXT_DARK

    bp2 = btf.add_paragraph()
    bp2.text = "FoodWatch features an open, real-time public impact page (/impact) providing full institutional transparency:\n• Donor Leaderboards: Recognizing top corporate and hotel donors to encourage CSR competition.\n• Category Breakdown: Live analytics tracking Grain, Dairy, Vegetable, and Cooked Meal distributions.\n• Live Verification Auditing: Every rescued batch displays verified pickup timestamps and NGO recipient receipts."
    bp2.font.size = Pt(10)
    bp2.font.color.rgb = C_TEXT_MUTED
    bp2.space_before = Pt(6)

    add_footer(s9, 9, 12)

    # =========================================================================
    # SLIDE 10: Policy Hub & IBM Bob AI Assistant
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_bg(s10, C_LIGHT_BG)
    add_header(s10, "POLICY & AI", "Government Scheme Alignment & AI Advisory", "Empowering users with actionable policy insights and conversational guidance.")

    # Left Column: Government Policy Alignment
    left_c = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.75), Inches(4.9))
    left_c.fill.solid()
    left_c.fill.fore_color.rgb = C_CARD_BG
    left_c.line.color.rgb = C_CARD_BORDER

    ltb = s10.shapes.add_textbox(Inches(1.05), Inches(2.0), Inches(5.25), Inches(4.4))
    ltf = ltb.text_frame
    ltf.word_wrap = True

    p = ltf.paragraphs[0]
    p.text = "Key Government Policy Interfaces"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_TEXT_DARK

    schemes = [
        ("PM Kisan SAMPADA Yojana (PMKSY)", "Ministry of Food Processing Industries scheme offering up to 50% capital subsidy for integrated cold chain and post-harvest infrastructure."),
        ("Operation Greens (TOP to TOTAL)", "Price stabilization program for Tomatoes, Onions, and Potatoes, funding 50% transport and cold storage subsidies during gluts."),
        ("FSSAI IFSA (Save Food Share Food)", "Food Safety & Standards Authority guidelines establishing hygiene regulations and liability shields for surplus food donations."),
        ("RKVY-RAFTAAR Grants", "Funds agritech startups and community farmer producer organizations (FPOs) building hyperlocal aggregation centers.")
    ]

    for sc_t, sc_d in schemes:
        sp1 = ltf.add_paragraph()
        sp1.text = f"• {sc_t}"
        sp1.font.size = Pt(10.5)
        sp1.font.bold = True
        sp1.font.color.rgb = C_BLUE
        sp1.space_before = Pt(8)

        sp2 = ltf.add_paragraph()
        sp2.text = sc_d
        sp2.font.size = Pt(9)
        sp2.font.color.rgb = C_TEXT_MUTED
        sp2.space_before = Pt(2)

    # Right Column: IBM Bob AI Assistant
    right_c = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.75), Inches(1.8), Inches(5.75), Inches(4.9))
    right_c.fill.solid()
    right_c.fill.fore_color.rgb = RGBColor(248, 250, 255)
    right_c.line.color.rgb = RGBColor(199, 210, 254)

    rtb = s10.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.25), Inches(4.4))
    rtf = rtb.text_frame
    rtf.word_wrap = True

    rp = rtf.paragraphs[0]
    rp.text = "🤖 IBM Bob — AI Food Policy Assistant"
    rp.font.size = Pt(14)
    rp.font.bold = True
    rp.font.color.rgb = RGBColor(30, 58, 138)

    rp_sub = rtf.add_paragraph()
    rp_sub.text = "Inspired by IBM watsonx, 'Bob' is an embedded conversational assistant helping grassroots NGOs, caterers, and citizens navigate policy and food handling."
    rp_sub.font.size = Pt(9.5)
    rp_sub.font.color.rgb = C_TEXT_MUTED
    rp_sub.space_before = Pt(6)

    rp_h = rtf.add_paragraph()
    rp_h.text = "Example Queries Handled by Bob:"
    rp_h.font.size = Pt(10)
    rp_h.font.bold = True
    rp_h.font.color.rgb = C_TEXT_DARK
    rp_h.space_before = Pt(10)

    bob_queries = [
        "\"How do I apply for the PMKSY cold chain capital subsidy?\"",
        "\"What are the FSSAI hygiene rules for donating cooked rice?\"",
        "\"Which states have the highest post-harvest potato wastage?\"",
        "\"How can our shelter set up an automated pickup route?\""
    ]

    for q in bob_queries:
        qp = rtf.add_paragraph()
        qp.text = f"💬 {q}"
        qp.font.size = Pt(9)
        qp.font.color.rgb = RGBColor(67, 56, 202)
        qp.space_before = Pt(4)

    add_footer(s10, 10, 12)

    # =========================================================================
    # SLIDE 11: Scalability, Feasibility & Roadmap
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_bg(s11, C_LIGHT_BG)
    add_header(s11, "FUTURE SCOPE", "Scalability Model & Multi-Phase Roadmap", "A phased deployment strategy taking FoodWatch from city pilot to national scale.")

    phases = [
        ("PHASE 1 (DEPLOYED)", "Metro Foundation", C_EMERALD_DARK,
         "• Full-stack web platform active\n• Leaflet geospatial discovery\n• Atomic claim locking\n• Seed data across Delhi, Bengaluru, and Mumbai"),
        ("PHASE 2 (NEAR-TERM)", "Mobile & Logistics", C_BLUE,
         "• React Native iOS/Android app\n• 'FoodWatch Runners' volunteer delivery network\n• Push notifications via Firebase FCM\n• Automated route bundling"),
        ("PHASE 3 (MID-TERM)", "IoT & Smart Chillers", RGBColor(124, 58, 237),
         "• Integration with smart BLE temperature sensors\n• Real-time cold storage container tracking\n• Predictive AI forecasting wedding surplus volume\n• Neighborhood food bank micro-hubs"),
        ("PHASE 4 (SCALE)", "Corporate CSR & 80G", C_AMBER,
         "• Automated 80G tax exemption certificates\n• Corporate ESG/CSR compliance reporting\n• FSSAI national portal integration\n• Pan-India scale across Tier 2/3 cities")
    ]

    for i, (ph_name, ph_title, col, details) in enumerate(phases):
        left = Inches(0.8 + i * 2.98)
        c = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.8), Inches(2.78), Inches(4.9))
        c.fill.solid()
        c.fill.fore_color.rgb = C_CARD_BG
        c.line.color.rgb = C_CARD_BORDER

        # Phase header
        ph = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left + Inches(0.15), Inches(2.0), Inches(2.48), Inches(0.38))
        ph.fill.solid()
        ph.fill.fore_color.rgb = col
        ph.line.fill.background()
        php = ph.text_frame.paragraphs[0]
        php.text = ph_name
        php.font.size = Pt(9)
        php.font.bold = True
        php.font.color.rgb = C_WHITE
        php.alignment = PP_ALIGN.CENTER
        ph.text_frame.vertical_anchor = MSO_ANCHOR.MIDDLE

        tb = s11.shapes.add_textbox(left + Inches(0.15), Inches(2.5), Inches(2.48), Inches(4.0))
        tf = tb.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = ph_title
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_DARK

        p2 = tf.add_paragraph()
        p2.text = details
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = C_TEXT_MUTED
        p2.space_before = Pt(8)

    add_footer(s11, 11, 12)

    # =========================================================================
    # SLIDE 12: Conclusion & Call to Action (Dark Elegance)
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    add_bg(s12, C_DARK_BG)

    # Decorative emerald glow
    glow12 = s12.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.1))
    glow12.fill.solid()
    glow12.fill.fore_color.rgb = C_EMERALD
    glow12.line.fill.background()

    tb12 = s12.shapes.add_textbox(Inches(1.5), Inches(1.0), Inches(10.333), Inches(5.3))
    tf12 = tb12.text_frame
    tf12.word_wrap = True

    p0 = tf12.paragraphs[0]
    p0.text = "CONCLUSION & SDG 2 ALIGNMENT"
    p0.font.size = Pt(11)
    p0.font.bold = True
    p0.font.color.rgb = C_EMERALD
    p0.alignment = PP_ALIGN.CENTER

    p1 = tf12.add_paragraph()
    p1.text = "Feeding People, Not Landfills"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = C_WHITE
    p1.space_before = Pt(10)
    p1.alignment = PP_ALIGN.CENTER

    p2 = tf12.add_paragraph()
    p2.text = "FoodWatch bridges the critical divide between urban abundance and chronic hunger. By uniting geospatial technology, atomic state-locks, and grassroots community mobilization, we make Zero Hunger a tangible reality."
    p2.font.size = Pt(13)
    p2.font.color.rgb = RGBColor(203, 213, 225)
    p2.space_before = Pt(12)
    p2.alignment = PP_ALIGN.CENTER

    # 3 Summary Badge Cards
    badges = [
        ("SDG 2.1 Access to Food", "Ensuring safe, nutritious food all year round for the poor and vulnerable.", C_EMERALD),
        ("SDG 12.3 Halve Food Waste", "Cutting retail and consumer food waste while reducing supply chain losses.", C_BLUE),
        ("1M1B Youth Leadership", "Mobilizing technology to impact 1 million leaders for 1 billion citizens.", RGBColor(168, 85, 247))
    ]

    for i, (b_t, b_d, col) in enumerate(badges):
        left = Inches(1.8 + i * 3.3)
        bc = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(3.8), Inches(3.1), Inches(1.6))
        bc.fill.solid()
        bc.fill.fore_color.rgb = C_DARK_CARD
        bc.line.color.rgb = RGBColor(30, 41, 59)

        btb = s12.shapes.add_textbox(left + Inches(0.15), Inches(3.95), Inches(2.8), Inches(1.3))
        btf = btb.text_frame
        btf.word_wrap = True

        bp = btf.paragraphs[0]
        bp.text = b_t
        bp.font.size = Pt(11)
        bp.font.bold = True
        bp.font.color.rgb = col

        bp2 = btf.add_paragraph()
        bp2.text = b_d
        bp2.font.size = Pt(9)
        bp2.font.color.rgb = RGBColor(148, 163, 184)
        bp2.space_before = Pt(4)

    # Repository link pill
    rep_pill = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.4), Inches(5.75), Inches(6.5), Inches(0.65))
    rep_pill.fill.solid()
    rep_pill.fill.fore_color.rgb = C_DARK_CARD
    rep_pill.line.color.rgb = C_EMERALD
    rptf = rep_pill.text_frame
    rpp = rptf.paragraphs[0]
    rpp.text = "🔗 GitHub: github.com/zeaqc/FoodWatch-1m1b  •  Live Platform: localhost:3000"
    rpp.font.size = Pt(10.5)
    rpp.font.bold = True
    rpp.font.color.rgb = C_WHITE
    rpp.alignment = PP_ALIGN.CENTER
    rep_pill.text_frame.vertical_anchor = MSO_ANCHOR.MIDDLE

    add_footer(s12, 12, 12, is_dark=True)

    # Save presentation
    output_path = r"c:\Users\pranjal\OneDrive\Documents\project\FoodWatch_Project_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation successfully saved to: {output_path}")

if __name__ == "__main__":
    create_deck()
