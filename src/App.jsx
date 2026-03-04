import React, {useState,useEffect} from 'react'
import curriculum from './curriculum'
import chronological from "./chronological";
import {Table, Typography,Card,Tabs, Checkbox, Progress} from 'antd';
const {Title}=Typography;

const App = () => {
  const [contents, setContents]= useState(null);

  useEffect(()=>{
    fetch("https://lactationcoursedashboard-backend-production.up.railway.app/api/course")
      .then(res=>res.json())
      .then(data=>setContents(data));
  },[]);

  const handleCheck=async(key)=>{
    await fetch(`https://lactationcoursedashboard-backend-production.up.railway.app//api/course/${key}`,{
      method:"PUT"
    });

    const res = await fetch("https://lactationcoursedashboard-backend-production.up.railway.app/api/course");
    const data = await res.json();
    setContents(data);
  }
  if(!contents) return <div>Loading...</div>;

  const tableData=[];

  contents.sections.forEach((section)=>{
    section.parts.forEach(part=>{
      part.chapters.forEach(chapter=>{
        tableData.push({
          key: chapter.chapter,
          section: `Section ${section.section}`,
          sectionTitle: section.title,
          part: part.part,
          partTitle: part.title,
          chapter: chapter.chapter,
          chapterTitle: chapter.title,
          completed:chapter.completed
        })
      })
    })
  });

  contents.appendices?.forEach(app => {
    tableData.push({
      key: app.appendix,
      chapter: app.appendix,
      chapterTitle: app.title,
      completed: app.completed,
      isAppendix: true
    });
  });
  
  const chapterLookup={};

  tableData.forEach(ch=>{
    chapterLookup[ch.chapter]=ch.completed;
  });

  const columns=[
    {
      title:"Part",
      dataIndex:"part",
      key:"part",
    },
    {
      title:"Chapter No",
      dataIndex:"chapter",
      key:"chapter",
      sorter:(a,b)=>a.chapter-b.chapter,
    },
    {
      title:"Chapter Title",
      dataIndex:"chapterTitle",
      key:"chapterTitle",  
    },
    {
      title:"Completed",
      key:"completed",
      render:(_,record)=>(
        <Checkbox
          checked={record.completed}
          onChange={() => {
            handleCheck(record.key)
          }}
        />
      )
    }
  ]

  let totalItems = 0;
  let completedItems = 0;

  contents.sections.forEach(section => {
    section.parts.forEach(part => {
      part.chapters.forEach(ch => {
        totalItems++;
        if (ch.completed) completedItems++;
      });
    });
  });

  contents.appendices?.forEach(app => {
    totalItems++;
    if (app.completed) completedItems++;
  });

  const completionPercentage =
    totalItems === 0
      ? 0
      : Math.round((completedItems / totalItems) * 100);

  return (
    <div style={{padding:"40px", maxWidth:"1200px", margin:"auto"}}>
      <div className="" style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"40px"}}>
        <Title level={2} style={{margin:0}}>
          Lactation Consulting Dashboard
        </Title>

        <Progress
          percent={completionPercentage}
          status={completionPercentage===100 ? "success" : "active"}
          style={{marginBottom:"30px"}}
          type="circle"
          size={60}
        />
      </div>
      <Tabs>
        <Tabs.TabPane tab="Content" key="1">
          {
            contents.sections.map((section, index) => {
              const sectionData = [];

              section.parts.forEach((part) => {
                part.chapters.forEach((chapter) => {
                  sectionData.push({
                    key: chapter.chapter,
                    part: part.part,
                    chapter: chapter.chapter,
                    chapterTitle: chapter.title,
                    completed:chapter.completed
                  });
                });
              });

              const sectionCompleted = sectionData.filter(c => c.completed).length;

              const sectionPercent =
                sectionData.length === 0
                  ? 0
                  : Math.round((sectionCompleted / sectionData.length) * 100);
                      
              return(
                <Card
                  key={index}
                  style={{marginBottom:"24px"}}
                  title={`${section.section}. ${section.title}`}
                >
                  <Progress
                    percent={sectionPercent}
                    status={sectionPercent === 100 ? "success" : "active"}
                    style={{ marginBottom: "20px" }}
                  />

                  <Table
                    columns={columns}
                    dataSource={sectionData}
                    pagination={{pageSize:5}}
                    bordered
                  />
                  
                </Card>
              )
          })}
          {
            contents.appendices?.length > 0 && (
              <Card
                style={{ marginTop: "24px" }}
                title="Appendices"
              >
                {contents.appendices.map(app => (
                  <div
                    key={app.appendix}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: "1px solid #f0f0f0"
                    }}
                  >
                    <div>
                      <b>Appendix {app.appendix}</b> – {app.title}
                    </div>

                    <Checkbox
                      checked={app.completed}
                      onChange={() => handleCheck(app.appendix)}
                    />
                  </div>
                ))}
              </Card>
          )}
        </Tabs.TabPane>

        <Tabs.TabPane tab="Curriculum" key="2">
          <Card title="Core Curriculum Map" style={{ marginTop: "40px" }}>
          {curriculum.map((item, index) => {

            const total = item.chapters.length;

            const completedCount = item.chapters.filter(
              chNum => chapterLookup[chNum]
            ).length;

            const percent =
              total === 0 ? 0 : Math.round((completedCount / total) * 100);

            return (
              <div key={index} style={{ marginBottom: "20px" }}>
                <h3>{item.discipline}</h3>

                <Progress
                  percent={percent}
                  status={percent === 100 ? "success" : "active"}
                />

                <p>
                  Completed {completedCount} / {total}
                </p>
              </div>
            );
          })}
          </Card>
        </Tabs.TabPane>
        
        <Tabs.TabPane tab="Chronological" key="3">
          <Card title="Chronological Periods Map" style={{ marginTop: "40px" }}>
            {chronological.map((item, index) => {

              const total = item.chapters.length;

              const completedCount = item.chapters.filter(
                chNum => chapterLookup[chNum]
              ).length;

              const percent =
                total === 0 ? 0 : Math.round((completedCount / total) * 100);

              return (
                <div key={index} style={{ marginBottom: "20px" }}>
                  <h3>{item.period}</h3>

                  <Progress
                    percent={percent}
                    status={percent === 100 ? "success" : "active"}
                  />

                  <p>
                    Completed {completedCount} / {total}
                  </p>
                </div>
              );
            })}
          </Card>
        </Tabs.TabPane>
      </Tabs>
        
    </div>
  )
}

export default App
