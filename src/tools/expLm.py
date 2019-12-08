import bpy
import os
import json
import mathutils, math, struct, time

def doexp():
    bpy.ops.object.mode_set(mode='OBJECT')      
    scene = bpy.context.scene

    obj = bpy.context.active_object
    #if obj.data.tessface_uv_textures or len(obj.data.tessface_uv_textures) < 1:
    #    print("UV coordinates were not found! Did you unwrap your mesh?")
    #    return 


    with open("d:/temp/obj.lm", "wb") as file:
        strver = 'LAYAMODEL:05'
        verlen = 12 #len()
        file.write(struct.pack('<h12s',verlen,strver.encode('utf-8')))
        #Data:{ offset:u32,size:u32 }
        #Block:{count:u16}
        #allblocks：{start:u32,size:u32}[]
        #Strings:{offset:u32,count:u16}     offset based on Data

doexp()