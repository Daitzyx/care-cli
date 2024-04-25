import { useState } from 'react'
import { Layout, Menu } from 'antd'
import { UserOutlined, VideoCameraOutlined, UploadOutlined } from '@ant-design/icons'
import { Container } from './styles'

const { Sider } = Layout

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  return (
    <Container>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={toggleCollapsed}
        width={200}
        className="site-layout-background"
      >
        <div className="logo" />
        <Menu mode="inline">
          <Menu.SubMenu key="sub1" icon={<UserOutlined />} title="Menu 1">
            <Menu.Item key="1">Opção 1</Menu.Item>
            <Menu.Item key="2">Opção 2</Menu.Item>
            <Menu.Item key="3">Opção 3</Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu key="sub2" icon={<VideoCameraOutlined />} title="Menu 2">
            <Menu.Item key="4">Opção 4</Menu.Item>
            <Menu.Item key="5">Opção 5</Menu.Item>
            <Menu.Item key="6">Opção 6</Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu key="sub3" icon={<UploadOutlined />} title="Menu 3">
            <Menu.Item key="7">Opção 7</Menu.Item>
            <Menu.Item key="8">Opção 8</Menu.Item>
            <Menu.Item key="9">Opção 9</Menu.Item>
          </Menu.SubMenu>
        </Menu>
      </Sider>
    </Container>
  )
}
