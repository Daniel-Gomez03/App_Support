import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomHeader from '@/components/CustomHeader';
import TabBar from '@/components/TabBar';
import Inicio from './index';
import QA from './qa';
import Nuevo from './nuevo';
import Usuario from './usuario';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
    return (
        <Tab.Navigator
            screenOptions={{
                header: (props) => <CustomHeader {...props} />,
                headerShown: true,
                tabBarActiveTintColor: '#3C6034',
                tabBarInactiveTintColor: '#999999',
            }}
            tabBar={(props) => <TabBar {...props} />}
        >
            <Tab.Screen
                name="index"
                component={Inicio}
                options={{
                    title: 'Inicio',
                }}
            />
            <Tab.Screen
                name="qa"
                component={QA}
                options={{
                    title: 'Q&A',
                }}
            />
            <Tab.Screen
                name="nuevo"
                component={Nuevo}
                options={{
                    title: 'Nuevo',
                }}
            />
            <Tab.Screen
                name="usuario"
                component={Usuario}
                options={{
                    title: 'Usuario',
                }}
            />
        </Tab.Navigator>
    );
}