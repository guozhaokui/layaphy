import bpy
import os
import json
import mathutils, math, struct, time
import numpy as np
import array

def mesh_triangulate(me):
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.triangulate(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()

def doexp():
    bpy.ops.object.mode_set(mode='OBJECT')      
    scene = bpy.context.scene

    obj = bpy.context.active_object
    #if obj.data.tessface_uv_textures or len(obj.data.tessface_uv_textures) < 1:
    #    print("UV coordinates were not found! Did you unwrap your mesh?")
    #    return 
	me = obj.to_mesh()	# 获取 bpy.data.meshes[]
	mesh_triangulate(me)	# 转成三角形
	me.transform(obj.matrix_world)

	if obj.matrix_world.determinant() < 0.0:
		me.flip_normals()

	if hastex = len(me.uv_layers)>0:
		uv_layer = me.uv_layers.active.data[:]

	me_verts = me.vertices[:]
	face_index_pairs = [(face, index) for index, face in enumerate(me.polygons)]
	me.calc_normals_split()
	loops = me.loops
	smooth_groups, smooth_groups_tot = me.calc_smooth_groups()	# 计算平滑组
	materials = me.materials[:]		# 材质
	material_names = [m.name if m else None for m in materials] # 材质名称
	if not materials:
    	materials = [None]
        material_names = [name_compat(None)]	

	# 顶点
	for v in me_verts:
		v.co[:]			# 转成数组[x,y,z] 否则是 Vector

	# normal
	for f, f_index in face_index_pairs:
		for l_idx in f.loop_indices:
			loops[l_idx].normal			# 法线

	# uv
	uv = f_index = uv_index = uv_key = uv_val = uv_ls = None
	uv_face_mapping = [None] * len(face_index_pairs)	# 分配数组，内容为 None
	uv_dict = {}
	uv_get = uv_dict.get
	for f, f_index in face_index_pairs:		# 每一个face
		uv_ls = uv_face_mapping[f_index] = []
		for uv_index, l_index in enumerate(f.loop_indices):	# 面的索引，正常是四边形，上面三角化了，所以是三角形？
			uv = uv_layer[l_index].uv[:]	# 
			vertid = loops[l_index].vertex_index	# 对应的顶点索引

	del uv_dict, uv, f_index, uv_index, uv_ls, uv_get, uv_key, uv_val

	# group

	bpy.data.meshes.remove(me)	# 清理创建的mesh

	string_dict=[]	# 保存字符串数组，通过下标引用
    with open("d:/temp/obj.lm", "wb") as file:
        strver = 'LAYAMODEL:05'
        verlen = 12 #len()
        file.write(struct.pack('<h12s',verlen,strver.encode('utf-8')))

        #Data:{ offset:u32,size:u32 }
        #Block:{count:u16}
        #allblocks：{start:u32,size:u32}[]
        #Strings:{offset:u32,count:u16}     offset based on Data

		# # blocks
		
		# # "MESH" 块
		# blockname:u16, "MESH"
		# name:u16, "Glass"
		# vertexBufferCount:u16,	
		# # 下面是 vertexBufferCount 个vb数据
		#	vbstart:U32, based on Data.offset 
		#	vertCnt:U32
		# 	vertFlag:U16(string)	"POSITION,NORMAL,UV,TANGENT"
		#	# 下面是vertCnt个顶点数据。占用 vertCnt*stride(vertFlag)
		#	vertbuf:buffer
		# ibstart:u32
		# iblength:u32
		# ibBuffer:buffer
		# bonecnt:u16
		# ..
		# bindPoseDataStart:u32
		# bindPoseDataLength:u32

		# "SUBMESH" 块
		#	blockname:u16
		#   ibstart:u32
		#   ibcount:u32
		#   drawcnt:u17
		#		//下面是drawcnt个
		#		subibstart:u32
		#		subibcnt:u32
		#		bonedictofs:u32
		#		bonedictcnt:u32

		# temp
		# bytearray([1,2,3])
		# bytearray(b’abcef’)[2] 返回该字节对应的数，int类型
		# append(int) 尾部追加一个元素  insert(index, int) 在指定索引位置插入元素
		# bytearray 可以直接修改   b=bytearray([1,2,3]) b[1]=5
		# binary_file.write(b'\xDE\xAD\xBE\xEF')		b表示bytes
		# print(i.to_bytes(4, byteorder='little', signed=True))
		# bytes_from_list = bytes([255, 254, 253, 252])
		# i = int.from_bytes([255, 0, 0, 0], byteorder='big')
		# text = binary_data.decode('utf-8')

doexp()