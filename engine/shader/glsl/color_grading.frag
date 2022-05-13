#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D color_grading_lut_texture_sampler;

layout(location = 0) out highp vec4 out_color;


highp float COLORS;
highp float WIDTH;
highp float SIDE;
highp float HALF_PX_X;
highp float HALF_PX_Y;

highp vec4 bilinear(highp float cell, highp float x, highp float y)
{
    highp float cx = x * (SIDE - 1.0);
    highp float x_l = floor(cx);
    highp float x_t = ceil(cx);
    highp float frac_x = fract(cx);

    highp float cy = y * (SIDE - 1.0);
    highp float y_l = floor(cy);
    highp float y_t = floor(cy);
    highp float frac_y = fract(cy);

    highp vec2 uv_ll = vec2((x_l / SIDE + cell) / SIDE + HALF_PX_X, y_l /SIDE + HALF_PX_Y);
    highp vec2 uv_tl = vec2((x_t / SIDE + cell) / SIDE + HALF_PX_X, y_l /SIDE + HALF_PX_Y);
    highp vec2 uv_lt = vec2((x_l / SIDE + cell) / SIDE + HALF_PX_X, y_t /SIDE + HALF_PX_Y);
    highp vec2 uv_tt = vec2((x_t / SIDE + cell) / SIDE + HALF_PX_X, y_t /SIDE + HALF_PX_Y);
    highp vec4 color_ll = texture(color_grading_lut_texture_sampler, uv_ll);
    highp vec4 color_tl = texture(color_grading_lut_texture_sampler, uv_tl);
    highp vec4 color_lt = texture(color_grading_lut_texture_sampler, uv_lt);
    highp vec4 color_tt = texture(color_grading_lut_texture_sampler, uv_tt);

    highp vec4 color_l = mix(color_ll, color_tl, frac_x);
    highp vec4 color_t = mix(color_lt, color_tt, frac_x);
    highp vec4 color = mix(color_l, color_t, frac_y);
    return color;
}

void main()
{
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0);

    COLORS = float(lut_tex_size.y);
    WIDTH = float(lut_tex_size.x);
    SIDE = float(lut_tex_size.y);
    HALF_PX_X = 0.5 / WIDTH;
    HALF_PX_Y = 0.5 / SIDE;

    highp vec4 color = subpassLoad(in_color).rgba;
    
    highp float cell = color.b * (COLORS - 1.0);
    highp float cell_l = floor(cell);
    highp float cell_t = ceil(cell);
    highp float cell_frac = fract(cell);

    highp vec4 out_color_l = bilinear(cell_l, color.r, color.g);
    highp vec4 out_color_t = bilinear(cell_t, color.r, color.g);
    out_color = mix(out_color_l, out_color_t, cell_frac);
}
