#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"
#include "gbuffer.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;


layout(location = 0) out highp vec4 out_color;


void main()
{
    highp vec4 color = subpassLoad(in_color).rgba;
    highp float luminosity = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
    out_color = vec4(luminosity, luminosity, luminosity, color.a);
}
