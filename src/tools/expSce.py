import bpy
import os
import json

scene = bpy.context.scene
exp=[]
with open("d:/temp/sce.txt", "w") as file:
    for o in scene.objects:
        if o.type=='MESH' and o.rigid_body!=None:
            exp1={}
            exp1['name']=o.name
            dim = o.dimensions #Vector((2.0, 2.0, 2.0))
            exp1['dim']={'x':dim.x,'y':dim.y,'z':dim.z}
            loc = o.location #Vector((4.0, 0.0, 0.0))
            exp1['pos']={'x':loc.x,'y':loc.y,'z':loc.z}
            q=o.rotation_quaternion # Quaternion((0.9460918307304382, 0.3238984942436218, 0.0, 0.0)) 第一个是w。注意只有选择用四元数表示旋转的时候才有值，否则为1,0,0,0
            #o.rotation_euler #Euler((0.6596944332122803, -0.0, 0.0), 'XYZ') 绕x轴 37.8度
            exp1['quat']={'x':q.x,'y':q.y,'z':q.z,'w':q.w}
            mass=o.rigid_body.mass # friction restitution
            if( o.rigid_body.type=='PASSIVE'):
                mass=0
            exp1['mass']=mass
            exp.append(exp1)
        if o.type=='EMPTY':
            exp1={}
            exp1['name']=o.name
            loc=o.location
            exp1['pos']={'x':loc.x,'y':loc.y,'z':loc.z}
            q=o.rotation_quaternion
            exp1['quat']={'x':q.x,'y':q.y,'z':q.z,'w':q.w}
            if o.rigid_body_constraint!=None:
                exp1['type']='C_'+o.rigid_body_constraint.type
                exp1['A']=o.rigid_body_constraint.object1.name
                exp1['B']=o.rigid_body_constraint.object2.name
            exp.append(exp1)
            
    expstr = json.dumps(exp)
    file.write(expstr)
